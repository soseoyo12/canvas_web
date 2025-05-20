export default function BookContainer({ children }) {
  return (
    <>
      <div className="bookContainer">
        <input type="text" className="searchBook" />
        {children}
      </div>
    </>
  );
}
