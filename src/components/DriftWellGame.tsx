import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { DriftWellProps, GameState } from '../types';
import { createGameState, applyImpulse, tick, nextLevel } from '../engine/state';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../engine/constants';
import { useGameLoop } from '../hooks/useGameLoop';
import { useInput } from '../hooks/useInput';
import { useHighScore } from '../hooks/useHighScore';
import GameCanvas from './GameCanvas';
import HUD from './HUD';
import Rules from './Rules';
import GameOver from './GameOver';

export default function DriftWellGame({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  onGameOver,
}: DriftWellProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GameState>(createGameState(1, width, height));
  const [renderTick, setRenderTick] = useState(0);
  const { highScore, updateHighScore } = useHighScore();
  const { inputState, getImpulseDirection } = useInput(canvasRef);
  const wasDownRef = useRef(false);

  const state = stateRef.current;

  // Handle pointer release -> apply impulse
  useEffect(() => {
    if (wasDownRef.current && !inputState.isDown && state.phase === 'playing') {
      const impulse = getImpulseDirection(stateRef.current.particle);
      if (impulse) {
        applyImpulse(stateRef.current, impulse.dirX, impulse.dirY, impulse.dragDistance);
        setRenderTick((t) => t + 1);
      }
    }
    wasDownRef.current = inputState.isDown;
  }, [inputState.isDown, getImpulseDirection, state.phase]);

  // Game loop
  const handleTick = useCallback(
    (dt: number) => {
      const result = tick(stateRef.current, dt);
      if (result === 'over') {
        const finalScore = stateRef.current.score;
        updateHighScore(finalScore);
        onGameOver?.(finalScore);
      }
      setRenderTick((t) => t + 1);
    },
    [onGameOver, updateHighScore],
  );

  useGameLoop(handleTick, state.phase === 'playing');

  const handleStart = useCallback(() => {
    stateRef.current.phase = 'playing';
    setRenderTick((t) => t + 1);
  }, []);

  const handleRetry = useCallback(() => {
    stateRef.current = createGameState(1, width, height);
    setRenderTick((t) => t + 1);
  }, [width, height]);

  const handleNextLevel = useCallback(() => {
    stateRef.current = nextLevel(stateRef.current);
    setRenderTick((t) => t + 1);
  }, []);

  const handleShowRules = useCallback(() => {
    stateRef.current.phase = 'rules';
    setRenderTick((t) => t + 1);
  }, []);

  // Force re-read of state for render
  void renderTick;

  return (
    <div className="dw-container" style={{ width, height: height + 60 }}>
      <HUD
        level={state.levelNumber}
        energy={state.energy}
        maxEnergy={state.maxEnergy}
        checkpointsCollected={state.checkpointsCollected}
        totalCheckpoints={state.totalCheckpoints}
        score={state.score}
        onShowRules={handleShowRules}
      />

      <div className="dw-canvas-wrapper" style={{ position: 'relative', width, height }}>
        <GameCanvas
          state={state}
          pointerPos={inputState.currentPos}
          isPointerDown={inputState.isDown}
          canvasRef={canvasRef}
        />

        {state.phase === 'rules' && <Rules onStart={handleStart} />}

        {(state.phase === 'over' || state.phase === 'levelComplete') && (
          <GameOver
            score={state.score}
            highScore={Math.max(highScore, state.score)}
            levelReached={state.levelNumber}
            isLevelComplete={state.phase === 'levelComplete'}
            onRetry={handleRetry}
            onNextLevel={state.phase === 'levelComplete' ? handleNextLevel : undefined}
          />
        )}
      </div>
    </div>
  );
}
