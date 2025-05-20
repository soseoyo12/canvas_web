import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import BookContainer from './BookContainer';
import Book from './Book';
import AddBookButton from './AddBookButton';
import AddBook from './AddBook';
import './App.css'

function MainPage() {
  return (
    <>
      <Header />
      <BookContainer>
        <Book nickname="asdf" />
        <Book nickname="fdas" />
      </BookContainer>
      <AddBookButton />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/add" element={<AddBook />} />
      </Routes>
    </Router>
  );
}

export default App;
