import React from 'react';

interface RulesProps {
  onStart: () => void;
}

export default function Rules({ onStart }: RulesProps) {
  return (
    <div className="dw-overlay dw-rules">
      <h2 className="dw-title">Drift Well</h2>
      <p className="dw-tagline">Master gravity. Find the well.</p>

      <div className="dw-rules-list">
        <h3>How to Play</h3>
        <p>Navigate your particle through all checkpoint rings.</p>
        <ol>
          <li>Tap and drag to aim, release to push your particle</li>
          <li>Your particle has momentum, it keeps drifting</li>
          <li>Invisible gravity wells pull (or push) your particle</li>
          <li>Reach each checkpoint ring in order</li>
          <li>Each push costs energy. Hitting walls costs more.</li>
        </ol>
        <p className="dw-tip">
          Tip: Feel the drift. Let gravity do the work when you can.
        </p>
      </div>

      <button className="dw-btn" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
