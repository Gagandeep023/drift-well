import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(
  callback: (dt: number) => void,
  active: boolean,
): void {
  const callbackRef = useRef(callback);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((time: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
    }
    const dt = Math.min(time - lastTimeRef.current, 50); // cap dt at 50ms
    lastTimeRef.current = time;

    callbackRef.current(dt);
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (active) {
      lastTimeRef.current = 0;
      rafRef.current = requestAnimationFrame(loop);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [active, loop]);
}
