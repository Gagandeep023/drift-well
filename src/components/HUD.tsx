import React from 'react';

interface HUDProps {
  level: number;
  energy: number;
  maxEnergy: number;
  checkpointsCollected: number;
  totalCheckpoints: number;
  score: number;
  onShowRules: () => void;
}

export default function HUD({
  level,
  energy,
  maxEnergy,
  checkpointsCollected,
  totalCheckpoints,
  score,
  onShowRules,
}: HUDProps) {
  const energyPct = Math.max(0, (energy / maxEnergy) * 100);
  const energyColor =
    energyPct > 50 ? '#64ffda' : energyPct > 25 ? '#ffd764' : '#ff6464';

  return (
    <div className="dw-hud">
      <div className="dw-hud-row">
        <span className="dw-hud-level">Level {level}</span>
        <span className="dw-hud-score">Score: {score}</span>
        <button className="dw-hud-help" onClick={onShowRules} title="How to play">
          ?
        </button>
      </div>
      <div className="dw-hud-row">
        <div className="dw-energy-bar">
          <div
            className="dw-energy-fill"
            style={{ width: `${energyPct}%`, backgroundColor: energyColor }}
          />
          <span className="dw-energy-label">{Math.ceil(energy)}</span>
        </div>
        <span className="dw-hud-checkpoints">
          {checkpointsCollected}/{totalCheckpoints}
        </span>
      </div>
    </div>
  );
}
