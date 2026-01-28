// explore each path completely before backtracking and 
// exploring other paths 


export function dfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const stack = []; // lifo 
  const visited = new Set();

  stack.push(startNode);

  while (stack.length) {
    const current = stack.pop();

    if (current.isWall) continue;
    if (visited.has(current)) continue;

    visited.add(current);
    visitedNodesInOrder.push(current);

    if (current === endNode) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(endNode),
      };
    }

    const neighbours = getNeighbours(grid, current);
    for (const neighbour of neighbours) {
      if (!visited.has(neighbour) && !neighbour.isWall) {
        neighbour.previousNode = current;
        stack.push(neighbour);
      }
    }
  }

  return { visitedNodesInOrder, shortestPath: [] };
}

function getNeighbours(grid, node) {
  const neighbours = [];
  const { row, col } = node;
  if (row > 0) neighbours.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col > 0) neighbours.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  return neighbours;
}

function reconstructPath(endNode) {
  const path = [];
  let current = endNode;
  while (current) {
    path.unshift(current);
    current = current.previousNode;
  }
  return path;
}
