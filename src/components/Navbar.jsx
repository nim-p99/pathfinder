import React from 'react';
import '../styles/Navbar.css';

function Navbar({
  onStart,
  onClearPath,
  onClearWalls,
  onResetGrid,
  onStop,
  animationSpeed,
  setAnimationSpeed,
  isRunning,
  selectedAlgorithm,
  setSelectedAlgorithm,
  selectedBrush,
  setSelectedBrush,
}) {
  return (
    <div className="navbar">
      {/* algorithm selection */}
      <select 
        value={selectedAlgorithm} 
        onChange={(e) => setSelectedAlgorithm(e.target.value)}
        disabled={isRunning}
        className="algo-select"
      >
        <option value="BFS">Breadth First Search</option>
        <option value="DFS">Depth First Search</option>
        <option value="Dijkstra">Dijkstra</option>
        <option value="AStar">A* Search</option>
      </select>

      {/* brush selection */}
      <div className="brush-control">
        <span>Draw:</span>
        <select 
          value={selectedBrush} 
          onChange={(e) => setSelectedBrush(e.target.value)}
          disabled={isRunning}
          className="algo-select"
        >
          <option value="wall">Wall (Impassable)</option>
          <option value="2">Weight 2</option>
          <option value="3">Weight 3</option>
          <option value="5">Weight 5 (Heavy)</option>
          <option value="15">Weight 15 (Super Heavy)</option>
        </select>
      </div>

      <button className="start-btn" onClick={onStart} disabled={isRunning}>
        Visualise {selectedAlgorithm}
      </button>

      <button onClick={onClearPath} disabled={isRunning}>
        Clear Path
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
