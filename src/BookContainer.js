import React, { useCallback } from 'react';
import Book from './Book';

export default function BookContainer({ canvases = [], onCanvasClick, onNewCanvas, onDeleteClick, children }) {
  // Handle delete click with proper event handling
  const handleDeleteClick = useCallback((e, canvas) => {
    e.stopPropagation();
    onDeleteClick(canvas, e);
  }, [onDeleteClick]);
  return (
    <div className="bookContainer">
      <form action="" method='get'>
         <input type="text" className="searchBook" placeholder="검색..." />
      </form>
      <div className="bookList">
        {canvases.map((canvas) => (
          <div 
            key={canvas.id} 
            className="bookItem"
            onClick={() => onCanvasClick(canvas)}
          >
            <Book 
              id={canvas.id}
              title={canvas.title}
              image={canvas.data}
            />
            <button
              onClick={(e) => handleDeleteClick(e, canvas)}
              className="deleteButton"
              aria-label="삭제"
              title="삭제"
            >
              ×
            </button>
          </div>
        ))}
        <div className="book add-book" onClick={onNewCanvas}>
          <span>새 캔버스</span>
          <div className="canvasImage">
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              color: '#ccc'
            }}>
              +
            </div>
          </div>
        </div>
      </div>
      {children}
      <style jsx>{`
        .bookContainer {
          padding: 20px;
        }
        .searchBook {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .bookList {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .bookItem {
          position: relative;
          cursor: pointer;
        }
        .deleteButton {
          position: absolute;
          top: -10px;
          right: -10px;
          width: 24px;
          height: 24px;
          background: #ff4d4f;
          color: white;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          padding: 0;
          z-index: 10;
        }
        .deleteButton:hover {
          background: #ff7875;
        }
      `}</style>
    </div>
  );
}
