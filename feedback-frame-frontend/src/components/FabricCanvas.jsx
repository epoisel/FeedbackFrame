import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ containerRef }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let canvas = null;
    
    // Ensure the container and its dimensions are available
    if (containerRef.current) {
      const { offsetWidth: width, offsetHeight: height } = containerRef.current;

      canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: 'transparent',
      });

      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush.width = 5;
      canvas.freeDrawingBrush.color = "#000000";
    }

    return () => {
      if (canvas) {
        canvas.dispose();
      }
    };
  }, [containerRef]); // React to changes in the containerRef, if necessary

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />;
};

export default FabricCanvas;
