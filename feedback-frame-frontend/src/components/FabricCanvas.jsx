import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ width, height, imageUrl }) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null); // Ensure this line is correctly included

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
  
    setCanvas(initializedCanvas); // This line requires setCanvas to be defined as shown above

    initializedCanvas.isDrawingMode = true;
    initializedCanvas.freeDrawingBrush.width = 5;
    initializedCanvas.freeDrawingBrush.color = "#000000";

    return () => {
      initializedCanvas.dispose();
    };
  }, [width, height, imageUrl]); // Depend on imageUrl if you're using it to load an image

  return <canvas ref={canvasRef} />;
};

export default FabricCanvas;
