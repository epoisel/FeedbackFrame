import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let canvas = new fabric.Canvas(canvasRef.current);
    console.log('Canvas initialized.');

    const updateCanvasSize = () => {
      const container = canvasRef.current.parentElement;
      console.log(`Container dimensions: width=${container.clientWidth}, height=${container.clientHeight}`);
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      canvas.calcOffset();
      console.log(`Canvas dimensions set: width=${canvas.width}, height=${canvas.height}`);
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    if (imageUrl) {
      console.log(`Loading image: ${imageUrl}`);
      fabric.Image.fromURL(imageUrl, (img) => {
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        console.log(`Image loaded. Original dimensions: width=${img.width}, height=${img.height}, scale=${scale}`);
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
        console.log('Image added to canvas and scaled.');
      });
    }

    canvas.isDrawingMode = true;
    console.log('Drawing mode enabled.');

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      canvas.dispose();
      console.log('Canvas disposed.');
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="w-full h-full absolute top-0 left-0" />;
};

export default FabricCanvas;
