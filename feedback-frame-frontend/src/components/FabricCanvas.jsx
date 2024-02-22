import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let canvas = new fabric.Canvas(canvasRef.current);

    // Function to update the canvas size based on its container
    const updateCanvasSize = () => {
      const container = canvasRef.current.parentElement;
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      canvas.calcOffset();
    };

    // Ensure canvas size matches the container, especially after window resizes
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale the image to fit the canvas while maintaining its aspect ratio
        const imgScaleFactor = Math.max(
          canvas.width / img.width,
          canvas.height / img.height
        );
        img.set({
          scaleX: imgScaleFactor,
          scaleY: imgScaleFactor,
          originX: 'center',
          originY: 'center',
          top: canvas.height / 2,
          left: canvas.width / 2,
          selectable: false,
        });
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
      });
    }

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = 'blue';

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default FabricCanvas;
