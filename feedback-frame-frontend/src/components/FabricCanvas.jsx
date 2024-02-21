import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ width, height }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  // Initialize Fabric.js canvas
  useEffect(() => {
    const initializedCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'transparent',
    });
    setCanvas(initializedCanvas);

    // Optional: Setup for drawing mode or other initial settings
    initializedCanvas.isDrawingMode = true;
    initializedCanvas.freeDrawingBrush.width = 5;
    initializedCanvas.freeDrawingBrush.color = "#000000";

    // Cleanup
    return () => {
      initializedCanvas.dispose();
    };
  }, [width, height]);

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
