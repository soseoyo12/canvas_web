import React from 'react';
import './CanvasContainer.css';

export default function CanvasContainer({ children }) {
  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        {children}
      </div>
    </div>
  );
}
