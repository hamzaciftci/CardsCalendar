import { useEffect, useState, useCallback } from "react";
import type { Card } from "@/engine";
import { loadCards, saveCards, hasSeeded, markSeeded, seedDemoCards } from "@/lib/storage";

export function useCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [ready, setReady] = useState(false);

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

  const update = useCallback((next: Card[]) => {
    setCards(next);
    saveCards(next);
  }, []);

  const addCard = useCallback(
    (c: Card) => {
      update([...loadCards(), c]);
    },
    [update],
  );

  const editCard = useCallback(
    (c: Card) => {
      update(loadCards().map((x) => (x.id === c.id ? c : x)));
    },
    [update],
  );

  const removeCard = useCallback(
    (id: string) => {
      update(loadCards().filter((x) => x.id !== id));
    },
    [update],
  );

  return { cards, ready, addCard, editCard, removeCard, setCards: update };
}
