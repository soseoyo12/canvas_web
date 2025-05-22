import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './Header';
import BookContainer from './BookContainer';
import Canvas from './Canvas';
import './App.css';

function HomePage() {
  const { id: canvasIdFromUrl } = useParams();
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [editingCanvas, setEditingCanvas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [canvasToDelete, setCanvasToDelete] = useState(null);
  const deleteModalRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 캔버스 목록 불러오기 및 URL 기반 캔버스 로드
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCanvases();
        
        // URL에 캔버스 ID가 있으면 해당 캔버스 로드
        if (canvasIdFromUrl) {
          const canvasToEdit = canvases.find(c => c.id === parseInt(canvasIdFromUrl));
          if (canvasToEdit) {
            await handleEditCanvas(canvasToEdit);
          }
        }
      } catch (error) {
        console.error('초기화 중 오류 발생:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    
    initialize();
  }, [canvasIdFromUrl]);

  const fetchCanvases = async () => {
    try {
      console.log('Fetching canvases from API...');
      // package.json의 프록시 설정을 사용하기 위해 상대 경로로 요청
      const response = await fetch('/api/canvases', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'  // 동일 출처 정책 사용
      });
      
      const responseText = await response.text();
      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
      }
      
      let data;
      try {
        data = responseText ? JSON.parse(responseText) : [];
        console.log('Parsed data:', data);
      } catch (e) {
        console.error('JSON 파싱 실패:', e);
        console.error('응답 내용:', responseText);
        throw new Error('서버로부터 잘못된 형식의 응답을 받았습니다');
      }
      
      if (Array.isArray(data)) {
        console.log('성공적으로', data.length, '개의 캔버스를 불러왔습니다');
        setCanvases(data);
      } else {
        console.error('예상치 못한 응답 형식:', data);
        setCanvases([]);
      }
      return data;
    } catch (error) {
      console.error('캔버스 목록을 불러오는 중 오류 발생:', error);
      throw error;
    }
  };

  // 새 캔버스 생성 핸들러
  const handleNewCanvas = useCallback(() => {
    navigate('/', { replace: true });
    setEditingCanvas(null);
    setShowCanvas(true);
  }, [navigate]);

  const handleEditCanvas = async (canvas) => {
    try {
      if (!canvas || !canvas.id) {
        throw new Error('유효하지 않은 캔버스입니다.');
      }
      
      console.log(`Attempting to edit canvas with ID: ${canvas.id}`);
      
      // URL 업데이트
      navigate(`/canvas/${canvas.id}`, { replace: true });
      
      // 캔버스의 전체 데이터를 가져옵니다.
      const response = await fetch(`/api/canvases/${canvas.id}`, {
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to load canvas:', response.status, errorText);
        
        if (response.status === 404) {
          throw new Error('요청하신 캔버스를 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.');
        } else {
          throw new Error(`캔버스 데이터를 불러오지 못했습니다. (${response.status} ${response.statusText})`);
        }
      }
      
      const fullCanvasData = await response.json();
      console.log('Editing canvas data:', fullCanvasData);
      
      if (!fullCanvasData) {
        throw new Error('캔버스 데이터가 비어있습니다.');
      }
      
      setEditingCanvas({
        ...canvas,
        data: fullCanvasData.data || canvas.data
      });
      setShowCanvas(true);
      
    } catch (error) {
      console.error('Error loading canvas data:', error);
      alert(`캔버스 로딩 오류: ${error.message}`);
      navigate('/', { replace: true });
    }
  };

  const handleSaveComplete = useCallback(async () => {
    try {
      console.log('Saving completed, refreshing canvas list...');
      // 캔버스 목록 새로고침
      await fetchCanvases();
      
      // 수정 중이던 캔버스 상태 초기화
      setEditingCanvas(null);
      
      // 캔버스 편집 모드 종료
      setShowCanvas(false);
      
      console.log('Canvas list refreshed');
    } catch (error) {
      console.error('Error updating canvas list:', error);
      alert(`캔버스 목록을 새로고침하는 중 오류가 발생했습니다: ${error.message}`);
    }
  }, [fetchCanvases]);

  // 캔버스 삭제 함수
  const handleDeleteClick = (canvas, e) => {
    if (e) e.stopPropagation(); // 이벤트 버블링 방지
    if (canvas) {
      setCanvasToDelete(canvas);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!canvasToDelete) return;
    
    try {
      const canvasId = canvasToDelete.id;
      if (!canvasId) {
        throw new Error('삭제할 캔버스 ID가 없습니다.');
      }
      
      console.log('Deleting canvas ID:', canvasId);
      
      // 1. Try with DELETE method first
      try {
        const response = await fetch(`/api/canvases/${canvasId}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
          },
          credentials: 'same-origin'
        });
        
        // Check if response is successful
        if (response.ok) {
          await fetchCanvases();
          setShowDeleteModal(false);
          setCanvasToDelete(null);
          alert('캔버스가 성공적으로 삭제되었습니다.');
          return;
        }
        
        // If not successful, try to parse error
        const errorText = await response.text();
        console.error('Delete failed with DELETE method:', response.status, errorText);
      } catch (deleteError) {
        console.error('Error with DELETE method:', deleteError);
      }
      
      // 2. If DELETE method fails, try with POST method (as a fallback)
      try {
        const response = await fetch(`/api/canvases/${canvasId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-HTTP-Method-Override': 'DELETE',
          },
          credentials: 'same-origin',
          body: JSON.stringify({ _method: 'DELETE' })
        });
        
        if (response.ok) {
          await fetchCanvases();
          setShowDeleteModal(false);
          setCanvasToDelete(null);
          alert('캔버스가 성공적으로 삭제되었습니다.');
          return;
        }
        
        const errorText = await response.text();
        console.error('Delete failed with POST method:', response.status, errorText);
        
        // If we get here, both methods failed
        if (response.status === 404) {
          throw new Error('이미 삭제된 캔버스이거나 존재하지 않는 캔버스입니다.');
        } else if (response.status >= 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
          throw new Error(`삭제에 실패했습니다. (${response.status} ${response.statusText})`);
        }
        
      } catch (postError) {
        console.error('Error with POST method:', postError);
        throw new Error('캔버스 삭제 중 오류가 발생했습니다. 서버에 연결할 수 없습니다.');
      }
      
    } catch (error) {
      console.error('Error deleting canvas:', error);
      alert(`캔버스 삭제 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setCanvasToDelete(null);
  };

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteModalRef.current && !deleteModalRef.current.contains(event.target)) {
        cancelDelete();
      }
    };

    if (showDeleteModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteModal]);

  // 로딩 중이면 로딩 표시
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (showCanvas) {
    return (
      <div className="canvas-fullscreen">
        <button 
          onClick={() => setShowCanvas(false)} 
          className="back-button"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          뒤로 가기
        </button>
        <Canvas 
          onSave={handleSaveComplete} 
          initialData={editingCanvas ? editingCanvas.data : null}
          title={editingCanvas ? editingCanvas.title : ''}
          editingCanvasId={editingCanvas ? editingCanvas.id : null}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <BookContainer 
          canvases={canvases} 
          onCanvasClick={handleEditCanvas} 
          onNewCanvas={handleNewCanvas}
          onDeleteClick={handleDeleteClick}
        />
      </main>

      {/* 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={deleteModalRef}
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">캔버스 삭제</h3>
            <p className="mb-6">
              정말로 "{canvasToDelete?.title || '이 캔버스'}"를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/canvas/:id" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
