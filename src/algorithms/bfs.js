// BREADTH FIRST SEARCH 
  // It modifies the node state and triggers
  // re-rendering. 
  //
  //
  // bfs recap:
  // checks all cells 1 step away 
  // then all cells 2 steps away 
  // then 3 steps away etc ..

export function bfs(grid, startNode, endNode) {
  const visitedNodesInOrder = [];
  const queue = [];
  const visited = new Set();

  queue.push(startNode);
  visited.add(startNode);

  // as long as there are nodes to explore 
  while (queue.length) {
    // remove oldest node 
    const current = queue.shift();

    if (current.isWall) continue; // skip ivalid nodes 

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
        visited.add(neighbour);
        neighbour.previousNode = current;
        queue.push(neighbour);
      }
    }
  }

  return {
    visitedNodesInOrder,
    shortestPath: [],
  };
}

function getNeighbours(grid, node) {
  const neighbours = [];
  const { row, col } = node;
  
  // add neighbours 
  if (row > 0) neighbours.push(grid[row-1][col]); // left node 
  if (row < grid.length - 1) neighbours.push(grid[row+1][col]); // right node 
  if (col > 0) neighbours.push(grid[row][col-1]); //  up 
  if (col < grid[0].length - 1) neighbours.push(grid[row][col + 1]); // down 

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

