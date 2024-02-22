import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);

    // Dynamically set canvas dimensions based on the image or container
    const setCanvasDimensions = (img) => {
      canvas.setWidth(img.width);
      canvas.setHeight(img.height);
      canvas.calcOffset(); // Recalculate canvas offset after resizing
    };

    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Optionally, you can scale the image to fit the canvas or container
        img.set({
          left: 0,
          top: 0,
          selectable: false, // Make image non-selectable if only annotations should be interactive
        });
        setCanvasDimensions(img);
        canvas.backgroundImage = img; // Use as background image to allow drawing over it
        canvas.requestRenderAll(); // Render the canvas to display the background image
      });
    }

    // Initialize drawing settings
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 5;
    canvas.freeDrawingBrush.color = "#000000";

    return () => {
      canvas.dispose(); // Clean up canvas when component unmounts
    };
  }, [imageUrl]); // Re-initialize when imageUrl changes

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default FabricCanvas;
