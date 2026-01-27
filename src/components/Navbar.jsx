import React from 'react';
import '../styles/Navbar.css';

function Navbar({
  onStartBFS,
  onClearPath,
  onClearWalls,
  onResetGrid,
  onStop,
  animationSpeed,
  setAnimationSpeed,
  isRunning
}) {
  return (
    <div className="navbar">
      <button onClick={onStartBFS} disabled={isRunning}>
        Start BFS
      </button>

      <button onClick={onClearPath} disabled={isRunning}>
        Clear Path
      </button>

      <button onClick={onClearWalls} disabled={isRunning}>
        Clear Walls
      </button>

      <button onClick={onResetGrid} disabled={isRunning}>
        Reset Grid
      </button>

      <button onClick={onStop}>
        Stop
      </button>

      <div className="speed-control">
        <span>Speed</span>
        <input
          type="range"
          min="1"
          max="100"
          value={animationSpeed}
          onChange={e => setAnimationSpeed(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default Navbar;
