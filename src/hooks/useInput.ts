import { useRef, useEffect, useCallback, useState } from 'react';
import type { Vec2 } from '../types';

interface InputState {
  isDown: boolean;
  startPos: Vec2 | null;
  currentPos: Vec2 | null;
}

interface UseInputReturn {
  inputState: InputState;
  getImpulseDirection: (particlePos: Vec2) => { dirX: number; dirY: number; dragDistance: number } | null;
}

function getPointerPos(
  e: PointerEvent | TouchEvent,
  canvas: HTMLCanvasElement,
): Vec2 {
  const rect = canvas.getBoundingClientRect();
  if ('touches' in e) {
    const touch = e.touches[0] || e.changedTouches[0];
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }
  return { x: (e as PointerEvent).clientX - rect.left, y: (e as PointerEvent).clientY - rect.top };
}

export function useInput(canvasRef: React.RefObject<HTMLCanvasElement | null>): UseInputReturn {
  const inputRef = useRef<InputState>({ isDown: false, startPos: null, currentPos: null });
  const [inputState, setInputState] = useState<InputState>({ isDown: false, startPos: null, currentPos: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const pos = getPointerPos(e, canvas);
      inputRef.current = { isDown: true, startPos: pos, currentPos: pos };
      setInputState({ ...inputRef.current });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!inputRef.current.isDown) return;
      e.preventDefault();
      const pos = getPointerPos(e, canvas);
      inputRef.current.currentPos = pos;
      setInputState({ ...inputRef.current });
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault();
      const pos = getPointerPos(e, canvas);
      inputRef.current = { isDown: false, startPos: inputRef.current.startPos, currentPos: pos };
      setInputState({ ...inputRef.current });
      // Clear after a frame so the release can be processed
      requestAnimationFrame(() => {
        inputRef.current = { isDown: false, startPos: null, currentPos: null };
        setInputState({ ...inputRef.current });
      });
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointerleave', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointerleave', handlePointerUp);
    };
  }, [canvasRef]);

  const getImpulseDirection = useCallback(
    (particlePos: Vec2): { dirX: number; dirY: number; dragDistance: number } | null => {
      const { startPos, currentPos } = inputRef.current;
      if (!startPos || !currentPos) return null;

      const dx = currentPos.x - particlePos.x;
      const dy = currentPos.y - particlePos.y;
      const dragDistance = Math.sqrt(
        (currentPos.x - startPos.x) ** 2 + (currentPos.y - startPos.y) ** 2,
      );

      if (dragDistance < 5) return null;

      return { dirX: dx, dirY: dy, dragDistance };
    },
    [],
  );

  return { inputState, getImpulseDirection };
}
