import { useRef, useEffect, useState } from "react";
import BackButton from "./BackButton";
import CanvasContainer from "./CanvasContainer";

export default function DrawingBoard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil"); // 'pencil' or 'eraser'

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 1400;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
  }, []);
//jjio
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = tool === "pencil" ? "black" : "white";
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  return (
    <CanvasContainer>
      <div style={{ position: "relative", width: "fit-content" }}>
        {/* 도구 버튼들 */}
        <div style={{ marginBottom: "10px" }}>
          <button onClick={() => setTool("pencil")}>✏️ 연필</button>
          <button onClick={() => setTool("eraser")}>🧽 지우개</button>
        </div>

        {/* 캔버스 */}
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid black",
            backgroundColor: "white",
            cursor: tool === "pencil" ? "crosshair" : "cell",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />

        <BackButton />
      </div>
    </CanvasContainer>
  );
}
