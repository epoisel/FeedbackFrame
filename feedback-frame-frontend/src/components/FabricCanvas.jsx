import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let canvas = new fabric.Canvas(canvasRef.current);
  
    // Function to update the canvas size based on its container
    const updateCanvasSize = () => {
      const container = canvasRef.current.parentElement;
      canvas.setWidth(container.clientWidth); // Adjust canvas width to fill the container
      canvas.setHeight(container.clientHeight); // Adjust canvas height to fill the container
      canvas.calcOffset();
    };
  
    // Adjust canvas size on window resize and initial load
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();
  
    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
        // Scale the image to fully cover the canvas dimensions
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        img.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: canvas.width / 2,
          top: canvas.height / 2,
          selectable: false,
        });
        canvas.add(img);
        canvas.renderAll();
      });
    }
  
    // Enable drawing mode
    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = 'blue';
  
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
    };
  }, [imageUrl]);