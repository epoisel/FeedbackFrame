import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl, width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const initializedCanvas = new fabric.Canvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: 'transparent',
    });
  
    // Load and display the image from imageUrl
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Consider scaling or positioning the image as needed
        img.scaleToWidth(width);
        img.scaleToHeight(height);
        initializedCanvas.add(img); // Adds the image as an object on the canvas
        initializedCanvas.sendToBack(img); // Ensures drawing can happen on top
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
