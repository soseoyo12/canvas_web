import React, { useRef, useState, useEffect, useCallback } from 'react';
import CanvasContainer from './CanvasContainer';
import './Canvas.css';

const Canvas = ({ onSave, initialData, editingCanvasId, title: propTitle }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [title, setTitle] = useState('');
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  // 캔버스 초기 설정
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 높은 품질의 라인을 위한 설정
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000000';
    
    // 캔버스 초기화 함수
    const initializeCanvas = () => {
      try {
        const container = canvas.parentElement;
        if (!container) return;
        
        const width = container.offsetWidth;
        const height = container.offsetHeight;
        
        // 캔버스 크기 설정
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        
        // 흰색 배경으로 채우기
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // 초기 데이터가 있으면 로드
        if (initialData) {
          console.log('Loading initial data into canvas...');
          const img = new Image();
          img.crossOrigin = 'anonymous'; // CORS 이슈 방지
          
          img.onload = () => {
            try {
              console.log('Image loaded, drawing to canvas...');
              // 이미지가 로드되면 캔버스에 그리기
              ctx.drawImage(img, 0, 0, width, height);
              console.log('Image drawn to canvas');
            } catch (e) {
              console.error('Error drawing image to canvas:', e);
            }
          };
          
          img.onerror = (e) => {
            console.error('이미지 로드 오류:', e);
            console.error('Image source:', initialData.substring(0, 100) + '...');
          };
          
          img.src = initialData;
        } else {
          console.log('No initial data provided');
        }
        
        setContext(ctx);
      } catch (error) {
        console.error('Error initializing canvas:', error);
      }
    };

    // 제목이 있으면 설정
    if (propTitle) {
      console.log('Setting title from props:', propTitle);
      setTitle(propTitle);
    }

    initializeCanvas();
    
    // 창 크기 변경 시 캔버스 크기 조정
    const handleResize = () => {
      initializeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [initialData, propTitle]);

  // 캔버스 지우기
  const clearCanvas = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation(); // 이벤트 버블링 방지
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 캔버스 크기 저장
    const width = canvas.width;
    const height = canvas.height;
    
    // 캔버스 초기화
    ctx.clearRect(0, 0, width, height);
    
    // 흰색 배경으로 채우기
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    
    // 선 스타일 재설정 (지우기 후에도 선 스타일이 유지되도록)
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // 터치/마우스 이벤트에서 좌표 가져오기
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const isTouch = e.type.includes('touch');
    
    return {
      x: (isTouch ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (isTouch ? e.touches[0].clientY : e.clientY) - rect.top,
      isTouch
    };
  };

  // 그리기 시작
  const startDrawing = useCallback((e) => {
    e.preventDefault(); // 터치 이벤트의 기본 동작 방지
    if (!context) return;
    
    const { x, y, isTouch } = getCoordinates(e);
    
    // 터치 이벤트인 경우에만 포커스 설정
    if (isTouch) {
      const canvas = canvasRef.current;
      canvas.style.touchAction = 'none';
      document.body.style.overflow = 'hidden';
    }
    
    setLastX(x);
    setLastY(y);
    
    context.beginPath();
    context.moveTo(x, y);
    context.strokeStyle = 'black';
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    setIsDrawing(true);
  }, [context]);

  // 그리기 중
  const draw = useCallback((e) => {
    e.preventDefault(); // 터치 이벤트의 기본 동작 방지
    if (!isDrawing || !context) return;
    
    const { x, y } = getCoordinates(e);
    
    // 부드러운 선을 위해 이전 위치에서 현재 위치까지 선 그리기
    context.beginPath();
    context.moveTo(lastX, lastY);
    context.lineTo(x, y);
    context.stroke();
    
    setLastX(x);
    setLastY(y);
  }, [isDrawing, context, lastX, lastY]);

  // 그리기 종료
  const stopDrawing = useCallback((e) => {
    if (e) e.preventDefault();
    
    if (context) {
      context.closePath();
    }
    
    // 터치 이벤트 관련 설정 초기화
    if (e && e.type.includes('touch')) {
      const canvas = canvasRef.current;
      canvas.style.touchAction = '';
      document.body.style.overflow = '';
    }
    
    setIsDrawing(false);
  }, [context]);

  // 캔버스 저장
  const saveCanvas = useCallback(async () => {
    if (!title || !title.trim()) {
      alert('제목을 입력해주세요.');
      return false;
    }
    
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('캔버스를 찾을 수 없습니다.');
      }
      
      // 캔버스 데이터를 이미지로 변환
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error('캔버스 컨텍스트를 가져올 수 없습니다.');
      }
      
      // 흰색 배경 추가
      tempCtx.fillStyle = 'white';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // 원본 캔버스 내용 복사
      tempCtx.drawImage(canvas, 0, 0);
      
      // 이미지 데이터 가져오기 (PNG 포맷으로 변환)
      const imageData = tempCanvas.toDataURL('image/png');
      
      const method = editingCanvasId ? 'PUT' : 'POST';
      const url = editingCanvasId ? `/api/canvases/${editingCanvasId}` : '/api/canvases';
      
      console.log(`Saving canvas with method: ${method}, url: ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          data: imageData
        }),
      });
      
      // 응답이 JSON 형식인지 확인
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.log('Non-JSON response:', text);
        throw new Error('서버에서 예상치 못한 응답을 받았습니다.');
      }
      
      if (!response.ok) {
        throw new Error(result.message || `저장에 실패했습니다. (${response.status} ${response.statusText})`);
      }
      
      console.log('Save successful:', result);
      
      if (onSave) {
        onSave();
      }
      
      return true;
    } catch (error) {
      console.error('Error saving canvas:', error);
      alert(`저장 중 오류가 발생했습니다: ${error.message}`);
      return false;
    }
  }, [title, editingCanvasId, onSave]);

  return (
    <div className="canvas-wrapper">
      <div className="canvas-controls">
        <div className="title-input-container">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="캔버스 제목을 입력하세요"
            className="canvas-title-input"
          />
        </div>
        <div className="button-group">
          <button 
            onClick={clearCanvas} 
            className="clear-button"
            style={{ marginRight: '10px' }}
          >
            지우기
          </button>
          <button 
            onClick={saveCanvas} 
            className="save-button"
          >
            {editingCanvasId ? '수정하기' : '저장하기'}
          </button>
        </div>
      </div>
      <CanvasContainer>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={(e) => {
            e.preventDefault();
            startDrawing(e.touches[0]);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            draw(e.touches[0]);
          }}
          onTouchEnd={stopDrawing}
        />
      </CanvasContainer>
    </div>
  );
};

export default Canvas;
