import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';

const NUM_ROWS = 20;
const NUM_COLS = 30;
const ANIMATION_SPEED = 1;


// the app is conceptually a 2d grid, where each cell
// has a state. You can modify the cell state with 
// the mouse. 
// An algorithm steps through cells over time
// The ui reflects that state visually 


// grid = array of rows 
// each row = array of nodes 
// each node = plain JS object 


function Grid() {

  // grid is where all the real data lives 
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  // ref to track running status in async loops 
  const isRunningRef = useRef(false);
  // track any dragged nodes.  null | 'start' | 'end'
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [startPos, setStartPos] = useState({ row:0, col:0 });
  const [endPos, setEndPos] = useState({ row:NUM_ROWS-1, col:NUM_COLS-1 });


  // mouse down --> start drawing
  const handleMouseDown = (row, col) => {
    const node = grid[row][col];
    if (node.isStart) setDraggedNodeType('start');
    else if (node.isEnd) setDraggedNodeType('end');
    else {
      toggleWall(row, col);
      setDraggedNodeType(null);
    }
    setMouseIsPressed(true);
  };

  // mouse enter --> draw IF drawing 
  const handleMouseEnter = (row, col) => {
    if (!mouseIsPressed) return;
    
    if (draggedNodeType === 'start') {
      moveStartNode(row, col);
    } else if (draggedNodeType === 'end') {
      moveEndNode(row, col);
    } else {
      toggleWall(row, col);
    }
  };

  // mouse up --> stop drawing 
  const handleMouseUp = (row, col) => {
    setMouseIsPressed(false);
    setDraggedNodeType(null);
  };


  const moveStartNode = (newRow, newCol) => {
    setGrid(prevGrid =>
      prevGrid.map(row =>
        row.map(node => {
          // remove old start 
          if (node.isStart) return { ...node, isStart: false };
          // set new start 
          if (node.row === newRow && node.col === newCol) return { ...node, isStart: true, isWall: false };
          return node;
        })
      )
    );
    setStartPos({ row: newRow, col: newCol });
  };

  const moveEndNode = (newRow, newCol) => {
    setGrid(prevGrid =>
      prevGrid.map(row =>
        row.map(node => {
          if (node.isEnd) return { ...node, isEnd:false};
          if (node.row === newRow && node.col === newCol) return { ...node, isEnd:true, isWall:false};
          return node;
        })
      )
    );
    setEndPos({ row: newRow, col: newCol });
  };


  const clearPath = () => {
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false,
        previousNode: null,
      }))
    );

    setGrid(newGrid)
  };

  const clearWalls = () => {
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isWall: false,
      }))
    );

    setGrid(newGrid);
  };

  const clearGrid = () => {
    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        isPath: false,
        previousNode: null,
        isWall: false,
      }))
    );
    setGrid(newGrid);
  }
  // initialise grid 
  useEffect(() => {
    // run this code ONCE, when component first appears 
    const initialGrid = [];
    for (let row=0; row<NUM_ROWS; row++) {
      const currentRow = [];
      for (let col=0; col<NUM_COLS; col++) {
        currentRow.push({
          row, col,
          isStart: row === 0 && col === 0,
          isEnd: row === NUM_ROWS-1 && col === NUM_COLS -1,
          isWall: false,
        });
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  }, []);  // we use [] to say dont rerun when state changes 

  const toggleWall = (row, col) => {
    // mak a copy of grid
    // never mutate state directly!
    const newGrid = grid.map(r => r.map(node => ({ ...node})));


    // get node at position [row][col]
    const node = newGrid[row][col];

    // start/end cannot be wall 
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall 
    }

    // update state 
    setGrid(newGrid)
  }


  // BREADTH FIRST SEARCH 
  // contained in Grid.jsx as bfs needs access to the 
  // entire grid. It modifies the node state and triggers
  // re-rendering. 
  const bfs = async (speed) => {
    const delay = 105 - speed;
    isRunningRef.current = true;
    setIsRunning(true);

    const newGrid = grid.map(row => row.map(node => ({ 
      ...node,
      isVisited: false,
      previousNode: null
    })));
    setGrid(newGrid);

    const startNode = newGrid[startPos.row][startPos.col];
    const endNode = newGrid[endPos.row][endPos.col];

    const queue = [startNode];

    while (queue.length) {
      if (!isRunningRef.current) return;

      const current = queue.shift();
      if (current.isWall || current.isVisited) continue;

      current.isVisited = true;
      setGrid([...newGrid]); // update state for animation
      // turn instant computation into visual stepping 
      // use await, otherwise will complete in 1 frame 
      await new Promise(resolve => setTimeout(resolve, delay));

      if (current.row === endNode.row && current.col === endNode.col) {
        // reached end, reconstruct path
        let pathNode = current;
        while (pathNode) {
          if (!isRunningRef.current) return;
          pathNode.isPath = true;
          pathNode = pathNode.previousNode;
          // newGrid = 2d array 
          // [...newGrid] creates a new top-level array 
          // react sees the reference change --> re-render
          setGrid([...newGrid]);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        setIsRunning(false);
        return;
      }

      // add neighbors
      const { row, col } = current;
      const neighbors = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
      ];

      neighbors.forEach(([r, c]) => {
        if (r >= 0 && r < NUM_ROWS && c >= 0 && c < NUM_COLS) {
          const neighbor = newGrid[r][c];
          if (!neighbor.isVisited && !neighbor.isWall) {
            neighbor.previousNode = current;
            queue.push(neighbor);
          }
        }
      });
    }
    setIsRunning(false);
  };
  

  return (
    <>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => bfs(animationSpeed)} disabled={isRunning}>
          Start BFS
        </button>
        <button onClick={clearPath} style={{ marginLeft: '8px' }} disabled={isRunning}>
          Clear path 
        </button>
        <button onClick={clearWalls} style={{ marginLeft: '8px' }} disabled={isRunning}>
          Clear walls 
        </button>
        <button onClick={clearGrid} style={{ marginLeft: '8px' }} disabled={isRunning}>
          Reset grid 
        </button>
        <button onClick={() => { isRunningRef.current = false; setIsRunning(false); }} style={{ marginLeft: '8px' }}>
          Stop 
        </button>
        <label>
          Animation speed:
          <input 
            type="range"
            value={animationSpeed}
            min="1"
            max="100"
            onChange={e => setAnimationSpeed(Number(e.target.value))}
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
          />
        </label>
      </div>
      <div onMouseUp={handleMouseUp}>
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex' }}>
            {row.map(( node, nodeIdx) => (
              <Node
                key={nodeIdx}
                isStart={node.isStart}
                isEnd={node.isEnd}
                isWall={node.isWall}
                isVisited={node.isVisited}
                isPath={node.isPath}
                onMouseDown={() => handleMouseDown(node.row, node.col)}
                onMouseEnter={() => handleMouseEnter(node.row, node.col)}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}


export default Grid;
