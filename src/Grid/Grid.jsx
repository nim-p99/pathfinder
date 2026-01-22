import React, { useState, useEffect } from 'react';
import Node from './Node';

const NUM_ROWS = 20;
const NUM_COLS = 30;


function Grid() {
  const [grid, setGrid] = useState([]);


  // initialise grid 
  useEffect(() => {
    const initialGrid = [];
    for (let row=0; row<NUM_ROWS; row++) {
      const currentRow = [];
      for (let col=0; col<NUM_COLS; col++) {
        currentRow.push({
          row, col,
          isStart: row === 0 & col === 0,
          isEnd: row === NUM_ROWS-1 && col === NUM_COLS -1,
          isWall: false,
        });
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  }, []);

  const toggleWall = (row, col) => {
    // mak a copy of grid
    const newGrid = grid.map(r => r.map(node => ({ ...node})));

    const node = newGrid[row][col];

    // start/end cannot be wall 
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall 
    }

    // update state 
    setGrid(newGrid)
  }

  return (
    <div>
      {grid.map((row, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex' }}>
          {row.map(( node, nodeIdx) => (
            <Node
              key={nodeIdx}
              isStart={node.isStart}
              isEnd={node.isEnd}
              isWall={node.isWall}
              onClick={() => toggleWall(node.row, node.col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}


export default Grid;
