import React, { useRef, useEffect, useCallback } from 'react';
import type { GameState, Vec2 } from '../types';
import { getNextCheckpointIndex } from '../engine/state';

interface GameCanvasProps {
  state: GameState;
  pointerPos: Vec2 | null;
  isPointerDown: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function GameCanvas({
  state,
  pointerPos,
  isPointerDown,
  canvasRef,
}: GameCanvasProps) {
  const animRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { particle, level, canvasWidth, canvasHeight } = state;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw walls
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    for (const wall of level.walls) {
      ctx.beginPath();
      ctx.moveTo(wall.x1, wall.y1);
      ctx.lineTo(wall.x2, wall.y2);
      ctx.stroke();
    }

    // Draw checkpoints
    const nextIdx = getNextCheckpointIndex(state);
    for (let i = 0; i < level.checkpoints.length; i++) {
      const cp = level.checkpoints[i];
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, cp.radius, 0, Math.PI * 2);

      if (cp.collected) {
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.15)';
        ctx.lineWidth = 1;
      } else if (i === nextIdx) {
        // Pulsing effect for next checkpoint
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.004);
        ctx.strokeStyle = `rgba(100, 255, 218, ${0.5 + pulse * 0.5})`;
        ctx.lineWidth = 2 + pulse;
      } else {
        ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Draw order number inside
      if (!cp.collected) {
        ctx.fillStyle = i === nextIdx ? 'rgba(100, 255, 218, 0.8)' : 'rgba(100, 255, 218, 0.3)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), cp.x, cp.y);
      }
    }

    // Draw subtle gravity distortion lines when particle is near wells
    for (const well of level.gravityWells) {
      const dx = well.x - particle.x;
      const dy = well.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < well.radius * 0.6) {
        const alpha = Math.max(0, 0.15 * (1 - dist / (well.radius * 0.6)));
        const color = well.strength > 0
          ? `rgba(100, 255, 218, ${alpha})`
          : `rgba(255, 100, 100, ${alpha})`;

        // Draw a few distortion lines pointing toward/away from well
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          const lineLen = 15 + Math.random() * 10;
          const startR = 8;
          ctx.beginPath();
          ctx.moveTo(
            well.x + Math.cos(a) * startR,
            well.y + Math.sin(a) * startR,
          );
          ctx.lineTo(
            well.x + Math.cos(a) * (startR + lineLen),
            well.y + Math.sin(a) * (startR + lineLen),
          );
          ctx.strokeStyle = color;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Draw particle trail
    for (let i = 0; i < particle.trail.length; i++) {
      const t = particle.trail[i];
      const alpha = (i / particle.trail.length) * 0.4;
      const radius = (i / particle.trail.length) * particle.radius * 0.6;
      ctx.beginPath();
      ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 255, 218, ${alpha})`;
      ctx.fill();
    }

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#64ffda';
    ctx.fill();

    // Inner glow
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    // Direction indicator when pointer is down
    if (isPointerDown && pointerPos) {
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(pointerPos.x, pointerPos.y);
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Arrow head at pointer position
      const adx = pointerPos.x - particle.x;
      const ady = pointerPos.y - particle.y;
      const angle = Math.atan2(ady, adx);
      const arrowSize = 8;
      ctx.beginPath();
      ctx.moveTo(pointerPos.x, pointerPos.y);
      ctx.lineTo(
        pointerPos.x - arrowSize * Math.cos(angle - 0.3),
        pointerPos.y - arrowSize * Math.sin(angle - 0.3),
      );
      ctx.moveTo(pointerPos.x, pointerPos.y);
      ctx.lineTo(
        pointerPos.x - arrowSize * Math.cos(angle + 0.3),
        pointerPos.y - arrowSize * Math.sin(angle + 0.3),
      );
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [state, pointerPos, isPointerDown, canvasRef]);

  useEffect(() => {
    const render = () => {
      draw();
      animRef.current = requestAnimationFrame(render);
    };
    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={state.canvasWidth}
      height={state.canvasHeight}
      className="dw-canvas"
      style={{ touchAction: 'none' }}
    />
  );
}
