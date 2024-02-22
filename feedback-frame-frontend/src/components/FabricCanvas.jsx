import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Example: Scale the image to fit the canvas width
        img.scaleToWidth(canvas.width);
        img.set({
          left: 0,
          top: 0,
          selectable: false, // Optional: make the image non-selectable
        });
        canvas.add(img); // Add the image to the canvas
        canvas.sendToBack(img); // Ensure the image is behind any annotations
      });
    }

    // Enable drawing mode
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 2; // Example brush width
    canvas.freeDrawingBrush.color = 'blue'; // Example brush color

    return () => {
      canvas.dispose(); // Clean up on component unmount
    };
  }, [imageUrl]); // Re-run effect if imageUrl changes

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
