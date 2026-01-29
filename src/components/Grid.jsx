import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import Navbar from './Navbar';
import '../styles/Grid.css';

import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import { dijkstra } from '../algorithms/dijkstra';
import { astar } from '../algorithms/astar';

const NUM_ROWS = 20;
const NUM_COLS = 25;
const NODE_SIZE = 40;
const NAVBAR_HEIGHT = 60;

// grid = array of rows 
// each row = array of nodes 
// each node = plain JS object 

function Grid() {

  // grid is where all the real data goes 
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  // track any dragged nodes. null | 'start' | 'end'
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [startPos, setStartPos] = useState({ row: 0, col: 0 });
  const [endPos, setEndPos] = useState({ row: NUM_ROWS - 1, col: NUM_COLS - 1 });
  const [scale, setScale] = useState(1);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('BFS');
  const [selectedBrush, setSelectedBrush] = useState('wall');
  // ref to track runing status in async loops 
  const isRunningRef = useRef(false);
  const gridRef = useRef(null);

  // initialise grid 
  useEffect(() => {
    const initialGrid = [];
    for (let row = 0; row < NUM_ROWS; row++) {
      const currentRow = [];
      for (let col = 0; col < NUM_COLS; col++) {
        currentRow.push({
          row,
          col,
          isStart: row === 0 && col === 0,
          isEnd: row === NUM_ROWS - 1 && col === NUM_COLS - 1,
          isWall: false,
          isVisited: false,
          isPath: false,
          previousNode: null,
          weight: 1,
        });
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  }, []);

  // scale grid to fit inside window 
  useEffect(() => {
    const updateScale = () => {
      const navbar = document.querySelector('.navbar');
      const navHeight = navbar ? navbar.offsetHeight : 60;

      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - navHeight;

      const scaleX = availableWidth / (NUM_COLS * NODE_SIZE);
      const scaleY = availableHeight / (NUM_ROWS * NODE_SIZE);

      setScale(Math.min(scaleX, scaleY, 1)); // 1 = max 
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  

  const drawOnGrid = (row, col) => {
    setGrid((prevGrid) =>
      prevGrid.map((r) =>
        r.map((node) => {
          if (node.row === row && node.col === col && !node.isStart && !node.isEnd) {
            
            // if brush = wall, toggle isWall.
            // if brush is a number, set weight and remove wall
            if (selectedBrush === 'wall') {
               return { ...node, isWall: !node.isWall, weight: 1 };
            } else {
               const newWeight = parseInt(selectedBrush);
               return { ...node, isWall: false, weight: newWeight };
            }
          }
          return node;
        })
      )
    );
  };
  
  const getCellFromPointer = (e) => {
    if (!gridRef.current) return null;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / (NODE_SIZE * scale));
    const row = Math.floor(y / (NODE_SIZE * scale));
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) return null;
    return { row, col };
  };

  // mouse down --> start drawing 
  const handlePointerDown = (e, row, col) => {
    e.preventDefault();
    if (isRunningRef.current) return;

    const node = grid[row][col];
    if (node.isStart) setDraggedNodeType('start');
    else if (node.isEnd) setDraggedNodeType('end');
    else {
      //drawOnGrid(row, col);
      toggleWall(row,col);
      setDraggedNodeType('draw');
    }
    setMouseIsPressed(true);
  };

  const handlePointerMove = (e) => {
    if (!mouseIsPressed || isRunningRef.current) return;
    const cell = getCellFromPointer(e);
    if (!cell) return;

    const { row, col } = cell;
    if (draggedNodeType === 'start') moveStartNode(row, col);
    else if (draggedNodeType === 'end') moveEndNode(row, col);
    else if (draggedNodeType === 'draw') applyBrush(row, col);
  };

  // mouse up --> stop drawing 
  const handlePointerUp = () => {
    setMouseIsPressed(false);
    setDraggedNodeType(null);
  };


  // const toggleWall = (row, col) => {
  //
  //   setGrid((prevGrid) =>
  //     prevGrid.map((r) =>
  //       r.map((node) =>
  //         node.row === row && node.col === col && !node.isStart && !node.isEnd
  //           ? { ...node, isWall: !node.isWall }
  //           : node
  //       )
  //     )
  //   );
  // };


  const toggleWall = (row, col) => {
    setGrid((prevGrid) =>
      prevGrid.map((r) =>
        r.map((node) => {
          if (node.row === row && node.col === col && !node.isStart && !node.isEnd) {
            
            // if brush = wall, it becomes toggle on/off
            if (selectedBrush === 'wall') {
              return { ...node, isWall: !node.isWall, weight: 1 };
            } 
            // if brush = number, apply it (no toggle)
            else {
              const newWeight = parseInt(selectedBrush);
              return { ...node, isWall: false, weight: newWeight };
            }
          }
          return node;
        })
      )
    );
  };

  const addWall = (row, col) => {
    setGrid((prevGrid) =>
      prevGrid.map((r) =>
        r.map((node) =>
          node.row === row && node.col === col && !node.isStart && !node.isEnd
            ? { ...node, isWall: true }
            : node
        )
      )
    );
  };

  const applyBrush = (row, col) => {
    setGrid((prevGrid) =>
      prevGrid.map((r) =>
        r.map((node) => {
          // dont modify start/end
          if (node.row === row && node.col === col && !node.isStart && !node.isEnd) {
            
            if (selectedBrush === 'wall') {
              return { ...node, isWall: true, weight: 1 };
            } 
            // if brush is a number, remove wall and set weight
            else {
              const newWeight = parseInt(selectedBrush);
              return { ...node, isWall: false, weight: newWeight };
            }
          }
          return node;
        })
      )
    );
  };

  const moveStartNode = (newRow, newCol) => {
    if (newRow === startPos.row && newCol === startPos.col) return;
    setStartPos({ row: newRow, col: newCol });


    const newGrid = grid.map((row) =>
      row.map((node) => {
        // remove old start 
        if (node.isStart) return { ...node, isStart: false };
        // set new start 
        if (node.row === newRow && node.col === newCol)
          return { ...node, isStart: true };
        return node;
      })
      );
    recomputePath(newGrid, newRow, newCol, endPos.row, endPos.col);
  };

  const moveEndNode = (newRow, newCol) => {
    if (newRow === endPos.row && newCol === endPos.col) return;
    setEndPos({ row: newRow, col: newCol });

    const newGrid = grid.map((row) => 
      row.map((node) => {
        if (node.isEnd) return { ...node, isEnd: false };
        if (node.row === newRow && node.col === newCol)
          return { ...node, isEnd: true };
        return node;
      })
    );
    recomputePath(newGrid, startPos.row, startPos.col, newRow, newCol);
  };

  // if we move end/start node --> recompute the path 
  const recomputePath = (gridToUse, startR = startPos.row, startC = startPos.col, endR = endPos.row, endC = endPos.col) => {
    const newGrid = gridToUse.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        previousNode: null,
        distance: Infinity, // dijkstra 
        gScore: Infinity,  // a*
        fScore: Infinity,  // a*
      }))
    );

    const startNode = newGrid[startR][startC];
    const endNode = newGrid[endR][endC];


    // need path to disappear if wall is blocking a solution
    // remember walls 
    const startWasWall = startNode.isWall;
    const endWasWall = endNode.isWall;
    
    startNode.isWall = false;
    endNode.isWall = false;

    let result;

    switch (selectedAlgorithm) {
      case 'DFS':
        result = dfs(newGrid, startNode, endNode);
        break;
      case 'Dijkstra':
        result = dijkstra(newGrid, startNode, endNode);
        break;
      case 'AStar':
        result = astar(newGrid, startNode, endNode);
        break;
      case 'BFS':
      default:
        result = bfs(newGrid, startNode, endNode);
        break;
    }

    const { shortestPath } = result;
    // draw path
    for (const node of shortestPath) node.isPath = true;
    // restore wall status 
    startNode.isWall = startWasWall;
    endNode.isWall = endWasWall;
    setGrid(newGrid);
  };

  const visualiseAlgorithm = async () => {
    if (!grid.length) return;
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    // create a clean grid for ui 
    const cleanGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        previousNode: null,
      }))
    );
    // update ui to show clean gid
    setGrid(cleanGrid);

    // create separate copy for algo to run on 
    const gridForAlgo = cleanGrid.map((row) =>
      row.map((node) => ({ ...node }))
    );

    const startNode = gridForAlgo[startPos.row][startPos.col];
    const endNode = gridForAlgo[endPos.row][endPos.col];

    // only toggle walls on algo grid 
    const startWasWall = startNode.isWall;
    const endWasWall = endNode.isWall;
    startNode.isWall = false;
    endNode.isWall = false;

    let result;
    switch (selectedAlgorithm) {
      case 'DFS':
        result = dfs(gridForAlgo, startNode, endNode);
        break;
      case 'Dijkstra':
        result = dijkstra(gridForAlgo, startNode, endNode);
        break;
      case 'AStar':
        result = astar(gridForAlgo, startNode, endNode);
        break;
      case 'BFS':
      default:
        result = bfs(gridForAlgo, startNode, endNode);
        break;
    }

    const { visitedNodesInOrder, shortestPath } = result;

    // animate --> loop updates clean grid based on visitedNodesInOrder
    await animateVisitedNodes(visitedNodesInOrder);
    
    // Only animate path if we actually found one
    if (shortestPath.length > 0) {
        await animatePath(shortestPath);
    }

    isRunningRef.current = false;
    setIsRunning(false);
  };
 
  const animateVisitedNodes = async (nodes) => {
    for (const node of nodes) {
      if (!isRunningRef.current) return;
      setGrid((prevGrid) =>
        prevGrid.map((row) =>
          row.map((n) =>
            n.row === node.row && n.col === node.col ? { ...n, isVisited: true } : n
          )
        )
      );
      await new Promise((res) => setTimeout(res, Math.max(10, 150 - animationSpeed)));
    }
  };

  const animatePath = async (path) => {
    for (const node of path) {
      if (!isRunningRef.current) return;
      setGrid((prevGrid) =>
        prevGrid.map((row) =>
          row.map((n) => (n.row === node.row && n.col === node.col ? { ...n, isPath: true } : n))
        )
      );
      await new Promise((res) => setTimeout(res, 40));
    }
  };

  const resetVisuals = () => {
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        gScore: Infinity,
        fScore: Infinity,
        previousNode: null,
      }))
    );
    setGrid(newGrid);
  };

  const clearPath = () => resetVisuals();


  const clearWalls = () => {
    setGrid((prevGrid) =>
      prevGrid.map((row) => row.map((node) => ({ ...node, isWall: false })))
    );
  };

  const clearGrid = () => {
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => ({
          ...node,
          isVisited: false,
          isPath: false,
          previousNode: null,
          isWall: false,
          distance: Infinity,
          gScore: Infinity,
          fScore: Infinity,
          weight: 1,
        }))
      )
    );
  };

  return (
    <>
      <Navbar
        onStart={visualiseAlgorithm}
        onClearPath={resetVisuals}
        onClearWalls={clearWalls}
        onResetGrid={clearGrid}
        onStop={() => {
          isRunningRef.current = false;
          setIsRunning(false);
        }}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        isRunning={isRunning}
        selectedAlgorithm={selectedAlgorithm}
        setSelectedAlgorithm={(algo) => {
          setSelectedAlgorithm(algo);
          resetVisuals();
        }}
        selectedBrush={selectedBrush}
        setSelectedBrush={setSelectedBrush}
      />

      <div
        className="grid-wrapper"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={gridRef}
          className="grid"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
          }}
        >
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="grid-row">
              {row.map((node, nodeIdx) => (
                <Node
                  key={nodeIdx}
                  isStart={node.isStart}
                  isEnd={node.isEnd}
                  isWall={node.isWall}
                  isVisited={node.isVisited}
                  isPath={node.isPath}
                  onPointerDown={(e) => handlePointerDown(e, node.row, node.col)}
                  weight={node.weight}
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
