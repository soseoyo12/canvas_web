export default function Book(props) {
  return (
    <>
      <div className="book">
        <span>{props.nickname}</span>
        <div className="canvasImage"></div>  
      </div>
    </>
  )
}