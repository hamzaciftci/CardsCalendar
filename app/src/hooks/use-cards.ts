import { useEffect, useState, useCallback } from "react";
import type { Card } from "@/engine";
import { loadCards, saveCards, hasSeeded, markSeeded, seedDemoCards } from "@/lib/storage";
import { useAuth } from "@/hooks/use-auth";
import { fetchCloudCards, upsertCloudCards, deleteCloudCard } from "@/lib/cloud";
import { isCloudEnabled } from "@/lib/supabase";

export function useCards() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [cards, setCards] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);

  // Yerel öncelikli: önce cihazdaki veri, ilk açılışta örnek kartlar
  useEffect(() => {
    let initial = loadCards();
    if (initial.length === 0 && !hasSeeded()) {
      initial = seedDemoCards();
      saveCards(initial);
      markSeeded();
    }
    setCards(initial);
    setReady(true);
  }, []);

  // Girişte bulutla eşitle: bulut doluysa bulut kazanır, boşsa yerel yüklenir
  useEffect(() => {
    if (!userId || !isCloudEnabled()) return;
    let cancelled = false;
    (async () => {
      const remote = await fetchCloudCards();
      if (cancelled || remote === null) return;
      if (remote.length > 0) {
        setCards(remote);
        saveCards(remote);
      } else {
        const local = loadCards();
        if (local.length > 0) await upsertCloudCards(local, userId);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const update = useCallback((next: Card[]) => {
    setCards(next);
    saveCards(next);
  }, []);

  const addCard = useCallback(
    (c: Card) => {
      update([...loadCards(), c]);
      if (userId) void upsertCloudCards([c], userId);
    },
    [update, userId],
  );

  const editCard = useCallback(
    (c: Card) => {
      update(loadCards().map((x) => (x.id === c.id ? c : x)));
      if (userId) void upsertCloudCards([c], userId);
    },
    [update, userId],
  );

  const removeCard = useCallback(
    (id: string) => {
      update(loadCards().filter((x) => x.id !== id));
      if (userId) void deleteCloudCard(id);
    },
    [update, userId],
  );

  return { cards, ready, addCard, editCard, removeCard, setCards: update };
}
