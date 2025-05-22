import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Canvas from './Canvas';

const CanvasList = () => {
  const [canvases, setCanvases] = useState([]);
  const [selectedCanvas, setSelectedCanvas] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const navigate = useNavigate();

  // 캔버스 목록 불러오기
  useEffect(() => {
    const fetchCanvases = async () => {
      try {
        const response = await fetch('/api/canvases');
        if (response.ok) {
          const data = await response.json();
          setCanvases(data);
        }
      } catch (error) {
        console.error('Error fetching canvases:', error);
      }
    };

    fetchCanvases();
  }, []);

  // 캔버스 선택 시 상세 보기
  const handleCanvasSelect = (canvas) => {
    setSelectedCanvas(canvas);
    setShowCanvas(true);
  };

  // 캔버스 저장 후 목록 새로고침
  const handleSaveComplete = () => {
    setShowCanvas(false);
    // 목록 새로고침
    fetch('/api/canvases')
      .then(res => res.json())
      .then(data => setCanvases(data));
  };

  if (showCanvas) {
    return (
      <div className="canvas-detail">
        <button onClick={() => setShowCanvas(false)} className="back-button">
          목록으로 돌아가기
        </button>
        <Canvas 
          onSave={handleSaveComplete}
          initialData={selectedCanvas?.data}
        />
      </div>
    );
  }

  return (
    <div className="canvas-list-container">
      <h2>내 캔버스 목록</h2>
      <button 
        onClick={() => {
          setSelectedCanvas(null);
          setShowCanvas(true);
        }} 
        className="new-canvas-button"
      >
        새 캔버스 만들기
      </button>
      
      <div className="canvas-grid">
        {canvases.map((canvas) => (
          <div 
            key={canvas.id} 
            className="canvas-item"
            onClick={() => handleCanvasSelect(canvas)}
          >
            <div className="canvas-thumbnail">
              {canvas.data && (
                <img 
                  src={canvas.data} 
                  alt={canvas.title} 
                  className="canvas-image"
                />
              )}
            </div>
            <div className="canvas-info">
              <h3>{canvas.title}</h3>
              <span>{new Date(canvas.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanvasList;
