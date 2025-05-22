import { useNavigate } from 'react-router-dom';

export default function Book({ id, title, image, onClick }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    } else if (id) {
      navigate(`/canvas/${id}`);
    }
  };

  return (
    <div className="book" onClick={handleClick}>
      <div className="book-title">{title || '제목 없음'}</div>
      <div className="canvasImage">
        {image ? (
          <img 
            src={image} 
            alt={title || '캔버스 이미지'} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: 'white'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: '#999'
          }}>
            미리보기 없음
          </div>
        )}
      </div>
      <style jsx>{`
        .book {
          width: 150px;
          height: 200px;
          margin: 10px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          background: white;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .book:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .book-title {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .canvasImage {
          flex: 1;
          border: 1px solid #eee;
          border-radius: 2px;
          overflow: hidden;
          background-color: #f9f9f9;
        }
        .add-book .canvasImage {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          color: #ccc;
        }
      `}</style>
    </div>
  );
}