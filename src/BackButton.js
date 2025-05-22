import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <div className="addBookBtn" onClick={() => navigate('/')}
    style={{fontSize: '200%'}}>◀</div>   
  );
}