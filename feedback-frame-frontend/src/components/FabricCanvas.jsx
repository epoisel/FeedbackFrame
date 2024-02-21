import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ width, height, imageUrl }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    const initializedCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'transparent',
    });
    
    // Check if imageUrl is provided and load it
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, function(img) {
        // Set the image as the canvas background
        initializedCanvas.setBackgroundImage(img, initializedCanvas.renderAll.bind(initializedCanvas), {
          scaleX: width / img.width,
          scaleY: height / img.height,
        });
      });
    }
  
    setCanvas(initializedCanvas);
  
    initializedCanvas.isDrawingMode = true;
    initializedCanvas.freeDrawingBrush.width = 5;
    initializedCanvas.freeDrawingBrush.color = "#000000";
  
    return () => {
      initializedCanvas.dispose();
    };
  }, [width, height, imageUrl]);

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
