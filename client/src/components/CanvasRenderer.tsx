import { useEffect, useRef } from 'react';

interface CanvasElement {
  type: 'text' | 'circle' | 'rectangle' | 'line' | 'arrow';
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  radius?: number;
  width?: number;
  height?: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

interface CanvasInstructions {
  title?: string;
  width?: number;
  height?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  backgroundColor?: string;
  elements: CanvasElement[];
}

interface CanvasRendererProps {
  instructions: CanvasInstructions;
  className?: string;
}

export function CanvasRenderer({ instructions, className = "" }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !instructions) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (support both field name formats)
    canvas.width = instructions.canvasWidth || instructions.width || 800;
    canvas.height = instructions.canvasHeight || instructions.height || 600;

    // Clear and set background
    ctx.fillStyle = instructions.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render each element
    instructions.elements?.forEach((element) => {
      renderElement(ctx, element);
    });
  }, [instructions]);

  const renderElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.save();

    switch (element.type) {
      case 'text':
        renderText(ctx, element);
        break;
      case 'circle':
        renderCircle(ctx, element);
        break;
      case 'rectangle':
        renderRectangle(ctx, element);
        break;
      case 'line':
        renderLine(ctx, element);
        break;
      case 'arrow':
        renderArrow(ctx, element);
        break;
    }

    ctx.restore();
  };

  const renderText = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (!element.text || element.x === undefined || element.y === undefined) return;

    ctx.fillStyle = element.color || '#000000';
    ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize || 16}px Arial`;
    
    // Handle text alignment properly
    ctx.textAlign = element.textAlign || 'left';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(element.text, element.x, element.y);
  };

  const renderCircle = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (element.x === undefined || element.y === undefined || !element.radius) return;

    ctx.beginPath();
    ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);

    if (element.fillColor) {
      ctx.fillStyle = element.fillColor;
      ctx.fill();
    }

    if (element.strokeColor) {
      ctx.strokeStyle = element.strokeColor;
      ctx.lineWidth = element.strokeWidth || 1;
      ctx.stroke();
    }
  };

  const renderRectangle = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (element.x === undefined || element.y === undefined || !element.width || !element.height) return;

    if (element.fillColor) {
      ctx.fillStyle = element.fillColor;
      ctx.fillRect(element.x, element.y, element.width, element.height);
    }

    if (element.strokeColor) {
      ctx.strokeStyle = element.strokeColor;
      ctx.lineWidth = element.strokeWidth || 1;
      ctx.strokeRect(element.x, element.y, element.width, element.height);
    }
  };

  const renderLine = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (element.x1 === undefined || element.y1 === undefined || 
        element.x2 === undefined || element.y2 === undefined) return;

    ctx.beginPath();
    ctx.moveTo(element.x1, element.y1);
    ctx.lineTo(element.x2, element.y2);
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 1;
    ctx.stroke();
  };

  const renderArrow = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    if (element.x1 === undefined || element.y1 === undefined || 
        element.x2 === undefined || element.y2 === undefined) return;

    const headLength = 15;
    const angle = Math.atan2(element.y2 - element.y1, element.x2 - element.x1);

    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(element.x1, element.y1);
    ctx.lineTo(element.x2, element.y2);
    ctx.strokeStyle = element.strokeColor || '#000000';
    ctx.lineWidth = element.strokeWidth || 2;
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(element.x2, element.y2);
    ctx.lineTo(
      element.x2 - headLength * Math.cos(angle - Math.PI / 6),
      element.y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(element.x2, element.y2);
    ctx.lineTo(
      element.x2 - headLength * Math.cos(angle + Math.PI / 6),
      element.y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        {instructions.title}
      </h3>
      <canvas
        ref={canvasRef}
        className="border border-gray-300 dark:border-gray-600 rounded-lg shadow-md bg-white"
        style={{
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </div>
  );
}