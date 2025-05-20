import { useNavigate } from 'react-router-dom';

export default function AddBookButton() {
  const navigate = useNavigate();
  return (
    <div className="addBookBtn" onClick={() => navigate('/add')}>+</div>   
  );
}