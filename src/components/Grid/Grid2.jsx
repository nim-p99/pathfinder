import React, { useState, useEffect, useRef } from 'react';
import Node from './Node';
import { bfs } from '../../algorithms/bfs';
import Navbar from '../Navbar';
import '../../styles/Grid.css';

const NUM_ROWS = 20;
const NUM_COLS = 30;
const NODE_SIZE = 40;
const NAVBAR_HEIGHT = 60;

function Grid2() {
  const [grid, setGrid] = useState([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState(null);
  const [startPos, setStartPos] = useState({ row: 0, col: 0 });
  const [endPos, setEndPos] = useState({ row: NUM_ROWS - 1, col: NUM_COLS - 1 });
  const [scale, setScale] = useState(1);
  const [animationSpeed, setAnimationSpeed] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);

  /** --- Grid Initialization --- */
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
        });
      }
      initialGrid.push(currentRow);
    }
    setGrid(initialGrid);
  }, []);

  /** --- Scale grid to fit window --- */
  useEffect(() => {
    const updateScale = () => {
      const availableWidth = window.innerWidth;
      const availableHeight = window.innerHeight - NAVBAR_HEIGHT;

      const scaleX = availableWidth / (NUM_COLS * NODE_SIZE);
      const scaleY = availableHeight / (NUM_ROWS * NODE_SIZE);

      setScale(Math.min(scaleX, scaleY, 1));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  /** --- Helpers to get cell from pointer --- */
  const getCellFromPointer = (e) => {
    const gridRect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - gridRect.left) / scale;
    const y = (e.clientY - gridRect.top) / scale;
    const col = Math.floor(x / NODE_SIZE);
    const row = Math.floor(y / NODE_SIZE);
    if (row < 0 || row >= NUM_ROWS || col < 0 || col >= NUM_COLS) return null;
    return { row, col };
  };

  /** --- Pointer Events --- */
  const handlePointerDown = (e, row, col) => {
    e.preventDefault();
    if (isRunningRef.current) return;

    const node = grid[row][col];
    if (node.isStart) setDraggedNodeType('start');
    else if (node.isEnd) setDraggedNodeType('end');
    else {
      toggleWall(row, col);
      setDraggedNodeType('wall');
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
    else if (draggedNodeType === 'wall') addWall(row, col);
  };

  const handlePointerUp = () => {
    setMouseIsPressed(false);
    setDraggedNodeType(null);
  };

  /** --- Grid Modification --- */
  const toggleWall = (row, col) => {
    setGrid((prevGrid) =>
      prevGrid.map((r) =>
        r.map((node) =>
          node.row === row && node.col === col && !node.isStart && !node.isEnd
            ? { ...node, isWall: !node.isWall }
            : node
        )
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

  const moveStartNode = (newRow, newCol) => {
    if (newRow === startPos.row && newCol === startPos.col) return;
    setStartPos({ row: newRow, col: newCol });
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => {
          if (node.isStart) return { ...node, isStart: false };
          if (node.row === newRow && node.col === newCol)
            return { ...node, isStart: true, isWall: false };
          return node;
        })
      )
    );
    recomputePath(newRow, newCol, endPos.row, endPos.col);
  };

  const moveEndNode = (newRow, newCol) => {
    if (newRow === endPos.row && newCol === endPos.col) return;
    setEndPos({ row: newRow, col: newCol });
    setGrid((prevGrid) =>
      prevGrid.map((row) =>
        row.map((node) => {
          if (node.isEnd) return { ...node, isEnd: false };
          if (node.row === newRow && node.col === newCol)
            return { ...node, isEnd: true, isWall: false };
          return node;
        })
      )
    );
    recomputePath(startPos.row, startPos.col, newRow, newCol);
  };

  /** --- Path & BFS --- */
  const recomputePath = (startR = startPos.row, startC = startPos.col, endR = endPos.row, endC = endPos.col) => {
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        previousNode: null,
      }))
    );

    const startNode = newGrid[startR][startC];
    const endNode = newGrid[endR][endC];
    const { shortestPath } = bfs(newGrid, startNode, endNode);

    for (const node of shortestPath) node.isPath = true;

    setGrid(newGrid);
  };

  const visualiseBFS = async () => {
    if (!grid.length) return;
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    setIsRunning(true);

    // clear previous path but keep walls
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isVisited: false,
        isPath: false,
        previousNode: null,
      }))
    );
    setGrid(newGrid);

    const startNode = newGrid[startPos.row][startPos.col];
    const endNode = newGrid[endPos.row][endPos.col];

    const { visitedNodesInOrder, shortestPath } = bfs(newGrid, startNode, endNode);

    await animateVisitedNodes(visitedNodesInOrder);
    await animatePath(shortestPath);

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
      await new Promise((res) => setTimeout(res, 105 - animationSpeed));
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

  const clearPath = () => recomputePath(startPos.row, startPos.col, endPos.row, endPos.col);

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
        }))
      )
    );
  };

  /** --- Render --- */
  return (
    <>
      <Navbar
        onStartBFS={visualiseBFS}
        onClearPath={clearPath}
        onClearWalls={clearWalls}
        onResetGrid={clearGrid}
        onStop={() => {
          isRunningRef.current = false;
          setIsRunning(false);
        }}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        isRunning={isRunning}
      />

      <div
        className="grid-wrapper"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
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
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Grid2;
