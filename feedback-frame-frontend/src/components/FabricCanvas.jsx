import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const FabricCanvas = ({ imageUrl }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'transparent',
    });

    function resizeCanvas() {
      canvas.setWidth(canvasRef.current.clientWidth);
      canvas.setHeight(canvasRef.current.clientHeight);
    }

    // Adjust canvas size on window resize to maintain responsiveness
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (imageUrl) {
      fabric.Image.fromURL(imageUrl, function(img) {
        // Scale image to fit the canvas while maintaining aspect ratio
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let scale;
        if (imgRatio > canvasRatio) {
          scale = canvas.width / img.width;
        } else {
          scale = canvas.height / img.height;
        }
        img.scale(scale).set({
          left: (canvas.width - img.width * scale) / 2,
          top: (canvas.height - img.height * scale) / 2,
          selectable: false,
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
    }

    canvas.isDrawingMode = true;
    canvas.freeDrawingBrush.width = 2;
    canvas.freeDrawingBrush.color = 'blue';

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.dispose();
    };
  }, [imageUrl]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default FabricCanvas;
