export function astar(grid, startNode, endNode) {
  // uses manhattan distance heuristc 

  const visitedNodesInOrder = [];
  
  // initialise standard costs 
  for (const row of grid) {
    for (const node of row) {
      node.gScore = Infinity; 
      node.fScore = Infinity; 
    }
  }

  startNode.gScore = 0;
  startNode.fScore = heuristic(startNode, endNode);

  const openSet = [startNode]; // nodes to be evaluated

  while (openSet.length) {
    // get node with lowest fScore
    sortNodesByFScore(openSet);
    const current = openSet.shift();

    if (current.isWall) continue;

    visitedNodesInOrder.push(current);

    if (current === endNode) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(endNode),
      };
    }

    const neighbours = getNeighbours(grid, current);
    for (const neighbour of neighbours) {
      if (neighbour.isWall) continue; 

      // distance from start to neighbor through current
      const tentativeGScore = current.gScore + neighbour.weight;

      // if this path is better than any previous one
      if (tentativeGScore < neighbour.gScore) {
        neighbour.previousNode = current;
        neighbour.gScore = tentativeGScore;
        neighbour.fScore = tentativeGScore + heuristic(neighbour, endNode);
        
        // add to openSet if not already there
        if (!openSet.includes(neighbour)) {
          openSet.push(neighbour);
        }
      }
    }
  }
  return { visitedNodesInOrder, shortestPath: [] };
}

function heuristic(nodeA, nodeB) {
  // manhattan distance
  return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

function sortNodesByFScore(nodes) {
  nodes.sort((nodeA, nodeB) => nodeA.fScore - nodeB.fScore);
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
