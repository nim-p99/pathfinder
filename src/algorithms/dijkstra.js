export function dijkstra(grid, startNode, endNode) {
  const visitedNodesInOrder = [];

  // reset al nodes first 
  const unvisitedNodes = getAllNodes(grid);

  // set start node distance
  startNode.distance = 0;
  

  while (unvisitedNodes.length) {
    // sort by distance (smallest first)
    sortNodesByDistance(unvisitedNodes);
    
    const closestNode = unvisitedNodes.shift();

    // if wall --> skip
    if (closestNode.isWall) continue;

    // if distance == infitnity --> trapped 
    if (closestNode.distance === Infinity) return { visitedNodesInOrder, shortestPath: [] };

    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);

    if (closestNode === endNode) {
      return {
        visitedNodesInOrder,
        shortestPath: reconstructPath(endNode),
      };
    }

    updateUnvisitedNeighbours(closestNode, grid);
  }
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbours(node, grid) {
  const unvisitedNeighbours = getNeighbours(node, grid).filter(n => !n.isVisited);
  for (const neighbour of unvisitedNeighbours) {
    neighbour.distance = node.distance + 1;
    neighbour.previousNode = node;
  }
}

function getNeighbours(node, grid) {
  const neighbours = [];
  const { row, col } = node;
  if (row > 0) neighbours.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbours.push(grid[row + 1][col]);
  if (col > 0) neighbours.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbours.push(grid[row][col + 1]);
  return neighbours;
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      node.distance = Infinity; // reset distance
      nodes.push(node);
    }
  }
  return nodes;
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
