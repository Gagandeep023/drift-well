import { useState, useCallback } from 'react';

const STORAGE_KEY = 'drift-well-high-score';

export function useHighScore(): {
  highScore: number;
  updateHighScore: (score: number) => number;
} {
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const updateHighScore = useCallback(
    (score: number): number => {
      const newHigh = Math.max(score, highScore);
      if (newHigh > highScore) {
        setHighScore(newHigh);
        try {
          localStorage.setItem(STORAGE_KEY, String(newHigh));
        } catch {
          // localStorage may be unavailable
        }
      }
      return newHigh;
    },
    [highScore],
  );

  return { highScore, updateHighScore };
}
