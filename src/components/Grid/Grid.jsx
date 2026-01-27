import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import { bfs } from '../../algorithms/bfs';
import Navbar from '../Navbar';
import '../../styles/Grid.css';

const NUM_ROWS = 20;
const NUM_COLS = 30;


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
  const [animationSpeed, setAnimationSpeed] = useState(100);
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
      // setDraggedNodeType(null);
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
      addWall(row, col);
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
  };

  const addWall = (row, col) => {
    setGrid(prevGrid =>
      prevGrid.map(r =>
        r.map(node => {
          if (
            node.row === row &&
            node.col === col &&
            !node.isStart && 
            !node.isEnd 
          ) {
            return {...node, isWall:true };
          }
          return node;
        })
      )
    );
  };

  const visualiseBFS = async () => {
    clearPath();

    isRunningRef.current = true;
    setIsRunning(true);

    const newGrid = grid.map(row =>
      row.map(node => ({
        ...node,
        isVisited: false,
        previousNode: null,
      }))
    );

    setGrid(newGrid);

    const startNode = newGrid[startPos.row][startPos.col];
    const endNode = newGrid[endPos.row][endPos.col];

    const { visitedNodesInOrder, shortestPath } = bfs(
      newGrid,
      startNode,
      endNode 
    );

    await animateVisitedNodes(visitedNodesInOrder);
    await animatePath(shortestPath);

    isRunningRef.current = false;
    setIsRunning(false);
  }


  const animateVisitedNodes = async nodes => {
    for (const node of nodes) {
      if (!isRunningRef.current) return;
      
      setGrid(prevGrid => 
        prevGrid.map(row =>
          row.map(n =>
            n.row === node.row && n.col === node.col
              ? { ...n, isVisited: true }
              : n 
          )
        )  
      );

      await new Promise(res => setTimeout(res, 105 - animationSpeed));
    }
  };

  const animatePath = async path => {
    for (const node of path) {
      if (!isRunningRef.current) return;
      
      setGrid(prevGrid =>
        prevGrid.map(row =>
          row.map(n =>
            n.row === node.row && n.col === node.col 
              ? { ...n, isPath: true }
              : n 
          )
        )
      );

      await new Promise(res => setTimeout(res, 40));
    }
  };

  return (
    <>
      <Navbar 
        onStartBFS={visualiseBFS}
        onClearPath = {clearPath}
        onClearWalls = {clearWalls}
        onResetGrid = {clearGrid}
        onStop={() => {
          isRunningRef.current = false;
          setIsRunning(false);
        }}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        isRunning={isRunning}
      />
      <div className="grid-wrapper" onMouseUp={handleMouseUp}>
        <div className="grid">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid-row">
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
      </div>
    </>
  );
}


export default Grid;
