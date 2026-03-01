import React from 'react';

interface GameOverProps {
  score: number;
  highScore: number;
  levelReached: number;
  isLevelComplete: boolean;
  onRetry: () => void;
  onNextLevel?: () => void;
}

export default function GameOver({
  score,
  highScore,
  levelReached,
  isLevelComplete,
  onRetry,
  onNextLevel,
}: GameOverProps) {
  return (
    <div className="dw-overlay dw-game-over">
      <h2 className="dw-title">
        {isLevelComplete ? 'Level Complete!' : 'Out of Energy'}
      </h2>

      <div className="dw-stats">
        <div className="dw-stat">
          <span className="dw-stat-label">Score</span>
          <span className="dw-stat-value">{score}</span>
        </div>
        <div className="dw-stat">
          <span className="dw-stat-label">High Score</span>
          <span className="dw-stat-value">{highScore}</span>
        </div>
        <div className="dw-stat">
          <span className="dw-stat-label">Level</span>
          <span className="dw-stat-value">{levelReached}</span>
        </div>
        {score >= highScore && score > 0 && (
          <p className="dw-new-high">New High Score!</p>
        )}
      </div>

      <div className="dw-btn-row">
        {isLevelComplete && onNextLevel && (
          <button className="dw-btn dw-btn-primary" onClick={onNextLevel}>
            Next Level
          </button>
        )}
        <button className="dw-btn" onClick={onRetry}>
          {isLevelComplete ? 'Restart' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}
