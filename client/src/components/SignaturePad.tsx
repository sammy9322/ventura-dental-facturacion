import { useRef, useEffect, useState } from 'react';

interface Props {
  onSave: (signature: string) => void;
  initialValue?: string;
}

export default function SignaturePad({ onSave, initialValue }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Firma con tinta clara sobre fondo oscuro
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = initialValue;
    }
  }, [initialValue]);

  const getPosition = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const pos = getPosition(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e.nativeEvent);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasSignature(true);

    // Auto-guardar en cada trazo
    const dataUrl = canvas!.toDataURL('image/png');
    onSave(dataUrl);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
  };

  return (
    <div className="signature-pad-container">
      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        Firme en el área de abajo con el dedo o mouse
      </p>
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        style={{
          width: '100%',
          height: '160px',
          cursor: 'crosshair',
          touchAction: 'none',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          display: 'block',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      <div className="signature-pad-actions">
        {hasSignature && (
          <button type="button" className="btn btn-outline btn-sm" onClick={clearSignature}>
            ✕ Limpiar firma
          </button>
        )}
        {!hasSignature && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Aún no hay firma
          </span>
        )}
      </div>
    </div>
  );
}
