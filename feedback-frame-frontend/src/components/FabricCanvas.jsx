import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current);
    const container = canvasRef.current.parentElement;

    // Update canvas size to match the container's size
    const updateCanvasSize = () => {
        console.log(`Container size before update: width=${container.clientWidth}px, height=${container.clientHeight}px`);
        canvas.setWidth(container.clientWidth);
        canvas.setHeight(container.clientHeight);
        canvas.calcOffset();
        console.log(`Canvas size updated: width=${canvas.width}px, height=${canvas.height}px`);
      
    };

    // Initial size update
    updateCanvasSize();

    // Observe size changes
    const observer = new ResizeObserver(() => {
      updateCanvasSize();
    });
    observer.observe(container);

    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, (img) => {
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

    // Cleanup on component unmount
    return () => {
      observer.disconnect();
      canvas.dispose();
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0" />;
};

export default FabricCanvas;
