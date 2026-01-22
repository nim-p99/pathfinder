import React from 'react';
import './Node.css';


function Node({ isStart, isEnd, isWall, onClick }) {
  let className = 'node';
  if (isStart) className += ' node-start';
  else if (isEnd) className += ' node-end';
  else if (isWall) className += ' node-wall';

  return <div className={className} onClick={onClick}></div>;
}


export default Node;
