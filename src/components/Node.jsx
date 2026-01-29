import React from 'react';
import '../styles/Node.css';


// Node does not change the data, hence why it does not 
// use UseState. It receives props


function Node({ 
  isStart,
  isEnd,
  isWall,
  isVisited,
  isPath,
  weight,
  onPointerDown,
}) {

  let className = 'node';
  if (isStart) className += ' node-start';
  else if (isEnd) className += ' node-end';
  else if (isWall) className += ' node-wall';
  else if (isPath) className += ' node-path';
  else if (isVisited) className += ' node-visited';
  else if (weight > 1) className += ' node-weight'

  return <div
    className={className}
    onPointerDown={onPointerDown}
  >
  {weight > 1 && !isWall && !isStart && !isEnd ? weight : ''}
  </div>;
}


export default Node;
