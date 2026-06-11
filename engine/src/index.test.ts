import { describe, expect, test } from 'vitest';
import {
  type Card,
  cycleForMonth,
  interestFreeDays,
  nextDueDate,
  recommend,
  upcomingCycles,
} from './index';

/** new Date with 1-based month, so test rows read like the product doc. */
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const makeCard = (overrides: Partial<Card> = {}): Card => ({
  id: 'c1',
  name: 'Test Kart',
  bankName: 'Test Banka',
  color: '#1E5AF5',
  statementDay: 10,
  graceDays: 10,
  isActive: true,
  ...overrides,
});

describe('interestFreeDays — ürün dokümanı §7.3 senaryoları', () => {
  test.each([
    // [senaryo, kesim günü, harcama, beklenen kesim, beklenen son ödeme, beklenen gün]
    ['kesimden 1 gün sonra', 10, d(2026, 6, 11), d(2026, 7, 10), d(2026, 7, 20), 39],
    ['kesimden 1 gün önce', 10, d(2026, 6, 9), d(2026, 6, 10), d(2026, 6, 20), 11],
    ['kesim günü (muhafazakâr kural)', 10, d(2026, 6, 10), d(2026, 6, 10), d(2026, 6, 20), 10],
    ['ay sonu kesim, ay başı harcama', 31, d(2026, 7, 1), d(2026, 7, 31), d(2026, 8, 10), 40],
    ['ay sonu kesim, 30 günlük ay', 31, d(2026, 6, 15), d(2026, 6, 30), d(2026, 7, 10), 25],
    ['Şubat kısa ay (kesim 30)', 30, d(2027, 2, 1), d(2027, 2, 28), d(2027, 3, 10), 37],
    ['artık yıl Şubatı (kesim 30)', 30, d(2028, 2, 1), d(2028, 2, 29), d(2028, 3, 10), 38],
    ['yıl devri (Aralık → Ocak)', 5, d(2026, 12, 20), d(2027, 1, 5), d(2027, 1, 15), 26],
  ])('%s', (_name, statementDay, spend, cutoff, due, days) => {
    const r = interestFreeDays({ statementDay, graceDays: 10 }, spend);
    expect(r.cutoffDate).toEqual(cutoff);
    expect(r.dueDate).toEqual(due);
    expect(r.days).toBe(days);
  });

  test('kesim 31 + Şubat: ayın son gününe kısıtlanır', () => {
    const r = interestFreeDays({ statementDay: 31, graceDays: 10 }, d(2026, 2, 10));
    expect(r.cutoffDate).toEqual(d(2026, 2, 28)); // 2026 artık yıl değil
    expect(r.dueDate).toEqual(d(2026, 3, 10));
    expect(r.days).toBe(28);
  });

  test('grace 11 gün ise süre 1 gün uzar', () => {
    const r = interestFreeDays({ statementDay: 10, graceDays: 11 }, d(2026, 6, 11));
    expect(r.dueDate).toEqual(d(2026, 7, 21));
    expect(r.days).toBe(40);
  });

  test('harcama saatinin sonucu etkilememesi (gün normalizasyonu)', () => {
    const lateNight = new Date(2026, 5, 11, 23, 45, 12);
    expect(interestFreeDays({ statementDay: 10, graceDays: 10 }, lateNight).days).toBe(39);
  });
});

describe('recommend — eleme kuralları', () => {
  test('pasif kart gerekçesiyle elenir', () => {
    const r = recommend([makeCard({ isActive: false })], 1_000, d(2026, 6, 10));
    expect(r.best).toBeNull();
    expect(r.excluded).toHaveLength(1);
    expect(r.excluded[0].reason).toBe('Kart pasif');
  });

  test('kullanılabilir limiti yetersiz kart gerekçesiyle elenir', () => {
    const r = recommend([makeCard({ availableLimit: 5_200 })], 8_000, d(2026, 6, 10));
    expect(r.best).toBeNull();
    expect(r.excluded[0].reason).toMatch(/limit yetersiz/i);
  });

  test('limit bilgisi girilmemiş kart elenmez', () => {
    const r = recommend([makeCard()], 8_000, d(2026, 6, 10));
    expect(r.best?.card.id).toBe('c1');
    expect(r.excluded).toHaveLength(0);
  });
});

describe('recommend — sıralama ve skor', () => {
  test('en uzun faizsiz gün kazanır, alternatifler sıralı döner', () => {
    const cards = [
      makeCard({ id: 'kisa', statementDay: 17 }), // 10 Haz → kesim 17 Haz → 17 gün
      makeCard({ id: 'uzun', statementDay: 9 }),  // 10 Haz → kesim 9 Tem → 39 gün
    ];
    const r = recommend(cards, 1_000, d(2026, 6, 10));
    expect(r.best?.card.id).toBe('uzun');
    expect(r.best?.result.days).toBe(39);
    expect(r.alternatives.map((a) => a.card.id)).toEqual(['kisa']);
    expect(r.alternatives[0].result.days).toBe(17);
  });

  test('skor eşitliğinde kullanılabilir limiti yüksek kart önde', () => {
    const cards = [
      makeCard({ id: 'az', availableLimit: 10_000 }),
      makeCard({ id: 'cok', availableLimit: 20_000 }),
    ];
    const r = recommend(cards, 1_000, d(2026, 6, 10));
    expect(r.best?.card.id).toBe('cok');
  });

  test('yüksek doluluk cezası sıralamayı değiştirebilir ve uyarı üretir', () => {
    const cards = [
      // 39 gün ama harcama sonrası doluluk %90 → 39 - 2.5 = 36.5
      makeCard({ id: 'dolu', statementDay: 9, totalLimit: 10_000, availableLimit: 9_000 }),
      // 38 gün, doluluk düşük → ceza yok
      makeCard({ id: 'rahat', statementDay: 8, totalLimit: 100_000, availableLimit: 50_000 }),
    ];
    const r = recommend(cards, 8_000, d(2026, 6, 10));
    expect(r.best?.card.id).toBe('rahat');
    const dolu = r.alternatives.find((a) => a.card.id === 'dolu');
    expect(dolu?.warnings.join(' ')).toContain('%90');
  });

  test('devreden borç ağır ceza + uyarı alır', () => {
    const cards = [
      makeCard({ id: 'borclu', statementDay: 9, carriesDebt: true }), // 39 - 30 = 9
      makeCard({ id: 'temiz', statementDay: 17 }),                    // 17
    ];
    const r = recommend(cards, 1_000, d(2026, 6, 10));
    expect(r.best?.card.id).toBe('temiz');
    const borclu = r.alternatives.find((a) => a.card.id === 'borclu');
    expect(borclu?.warnings.join(' ')).toMatch(/devreden borç/i);
  });
});

describe('recommend — bekleme ipucu (waitTip)', () => {
  test('birkaç gün beklemek belirgin kazanç sağlıyorsa ipucu üretir', () => {
    // 8 Haz: kesim 10 Haz → 12 gün. 11 Haz'a (3 gün) beklenirse 39 gün.
    const r = recommend([makeCard()], 1_000, d(2026, 6, 8));
    expect(r.best?.result.days).toBe(12);
    expect(r.waitTip).not.toBeNull();
    expect(r.waitTip?.date).toEqual(d(2026, 6, 11));
    expect(r.waitTip?.days).toBe(39);
  });

  test('bugün zaten en iyi pencereyse ipucu üretmez', () => {
    const r = recommend([makeCard()], 1_000, d(2026, 6, 11)); // bugün 39 gün
    expect(r.best?.result.days).toBe(39);
    expect(r.waitTip).toBeNull();
  });

  test('devreden borçlu kart ipucu adayı olamaz', () => {
    const r = recommend([makeCard({ carriesDebt: true })], 1_000, d(2026, 6, 8));
    expect(r.waitTip).toBeNull();
  });
});

describe('recommend — boş durumlar', () => {
  test('hiç kart yoksa güvenli boş sonuç döner', () => {
    const r = recommend([], 1_000, d(2026, 6, 10));
    expect(r.best).toBeNull();
    expect(r.alternatives).toEqual([]);
    expect(r.excluded).toEqual([]);
    expect(r.waitTip).toBeNull();
  });
});

describe('upcomingCycles — takvim ve hatırlatma altyapısı', () => {
  test('ay sonu kartı kısa aylarda son güne kısıtlanır', () => {
    const cycles = upcomingCycles({ statementDay: 31, graceDays: 10 }, d(2026, 1, 15), 3);
    expect(cycles.map((c) => c.cutoffDate)).toEqual([
      d(2026, 1, 31),
      d(2026, 2, 28),
      d(2026, 3, 31),
    ]);
    expect(cycles[1].dueDate).toEqual(d(2026, 3, 10));
  });

  test('bu ayın kesimi geçtiyse sonraki aydan başlar', () => {
    const cycles = upcomingCycles({ statementDay: 10, graceDays: 10 }, d(2026, 6, 15), 2);
    expect(cycles[0].cutoffDate).toEqual(d(2026, 7, 10));
    expect(cycles[1].cutoffDate).toEqual(d(2026, 8, 10));
  });

  test('kesim günü bugünse bugünkü dönem dahildir', () => {
    const cycles = upcomingCycles({ statementDay: 10, graceDays: 10 }, d(2026, 6, 10), 1);
    expect(cycles[0].cutoffDate).toEqual(d(2026, 6, 10));
    expect(cycles[0].dueDate).toEqual(d(2026, 6, 20));
  });

  test('yıl devrini doğru yönetir', () => {
    const cycles = upcomingCycles({ statementDay: 5, graceDays: 10 }, d(2026, 12, 20), 2);
    expect(cycles[0].cutoffDate).toEqual(d(2027, 1, 5));
    expect(cycles[1].cutoffDate).toEqual(d(2027, 2, 5));
  });
});

describe('nextDueDate — yaklaşan son ödeme (hatırlatma bandı)', () => {
  const card = { statementDay: 1, graceDays: 10 };

  test('kesilmiş dönemin son ödemesi hâlâ öndeyse onu döner', () => {
    // kesim 1 Haz, son ödeme 11 Haz; bugün 10 Haz → yarın son gün
    expect(nextDueDate(card, d(2026, 6, 10))).toEqual(d(2026, 6, 11));
  });

  test('son ödeme günü bugünse bugünü döner', () => {
    expect(nextDueDate(card, d(2026, 6, 11))).toEqual(d(2026, 6, 11));
  });

  test('kesilmiş dönemin son ödemesi geçtiyse sonraki dönemi döner', () => {
    expect(nextDueDate(card, d(2026, 6, 12))).toEqual(d(2026, 7, 11));
  });

  test('ay başında önceki ayın kesiminden gelen son ödemeyi yakalar', () => {
    // kesim 25 May, son ödeme 4 Haz; bugün 2 Haz
    expect(nextDueDate({ statementDay: 25, graceDays: 10 }, d(2026, 6, 2))).toEqual(d(2026, 6, 4));
  });

  test('kesim günü bugünse bu dönemin son ödemesini döner', () => {
    expect(nextDueDate({ statementDay: 10, graceDays: 10 }, d(2026, 6, 10))).toEqual(d(2026, 6, 20));
  });

  test('Şubat kısıtlamasından gelen son ödemeyi doğru hesaplar', () => {
    // kesim günü 31 → 28 Şub'a kısıtlanır, son ödeme 10 Mar; bugün 5 Mar
    expect(nextDueDate({ statementDay: 31, graceDays: 10 }, d(2026, 3, 5))).toEqual(d(2026, 3, 10));
  });

  test('yıl başında önceki yılın Aralık kesimini yakalar', () => {
    // kesim 28 Ara 2025, son ödeme 7 Oca 2026; bugün 3 Oca 2026
    expect(nextDueDate({ statementDay: 28, graceDays: 10 }, d(2026, 1, 3))).toEqual(d(2026, 1, 7));
  });
});

describe('cycleForMonth — takvim görünümü', () => {
  test('kesim günü kısa ayda son güne kısıtlanır', () => {
    const c = cycleForMonth({ statementDay: 31, graceDays: 10 }, 2026, 1); // Şubat (0 tabanlı)
    expect(c.cutoffDate).toEqual(d(2026, 2, 28));
    expect(c.dueDate).toEqual(d(2026, 3, 10));
  });

  test('son ödeme bir sonraki aya taşabilir', () => {
    const c = cycleForMonth({ statementDay: 25, graceDays: 10 }, 2026, 5); // Haziran
    expect(c.cutoffDate).toEqual(d(2026, 6, 25));
    expect(c.dueDate).toEqual(d(2026, 7, 5));
  });

  test('negatif ay indeksi önceki yılın Aralık ayına düşer', () => {
    const c = cycleForMonth({ statementDay: 28, graceDays: 10 }, 2026, -1); // Aralık 2025
    expect(c.cutoffDate).toEqual(d(2025, 12, 28));
    expect(c.dueDate).toEqual(d(2026, 1, 7));
  });
});
