import React, { useRef, useEffect, useCallback, useState } from 'react';
import { CanvasProps } from '../types';

export const Canvas: React.FC<CanvasProps> = ({
  gridState,
  config,
  onCellClick,
  onCanvasDrag,
  onZoom
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState(false); // true = drawing, false = panning

  // Draw the grid
  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(config.panX, config.panY);
    ctx.scale(config.zoom, config.zoom);

    // Calculate visible area
    const cellSize = 1;
    const startX = Math.max(0, Math.floor(-config.panX / config.zoom));
    const startY = Math.max(0, Math.floor(-config.panY / config.zoom));
    const endX = Math.min(gridState.width, Math.ceil((canvas.width - config.panX) / config.zoom));
    const endY = Math.min(gridState.height, Math.ceil((canvas.height - config.panY) / config.zoom));

    // Draw cells
    ctx.fillStyle = '#00ff00';
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const index = y * gridState.width + x;
        if (gridState.cells[index] === 1) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw grid lines if zoomed in enough
    if (config.zoom > 5) {
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 0.1;
      
      for (let x = startX; x <= endX; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, startY * cellSize);
        ctx.lineTo(x * cellSize, endY * cellSize);
        ctx.stroke();
      }
      
      for (let y = startY; y <= endY; y++) {
        ctx.beginPath();
        ctx.moveTo(startX * cellSize, y * cellSize);
        ctx.lineTo(endX * cellSize, y * cellSize);
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [gridState, config]);

  // Redraw when grid or config changes
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  // Helper to get grid coordinates from mouse event
  const getGridCoords = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor((x - config.panX) / config.zoom);
    const gridY = Math.floor((y - config.panY) / config.zoom);
    if (gridX >= 0 && gridX < gridState.width && gridY >= 0 && gridY < gridState.height) {
      return { gridX, gridY };
    }
    return null;
  };

  // Mouse events for drawing and panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Left button: draw, Right button or space: pan
    if (e.button === 0 && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
      setIsDrawing(true);
      setDrawMode(true);
      const coords = getGridCoords(e);
      if (coords) onCellClick(coords.gridX, coords.gridY);
    } else if (e.button === 2 || e.button === 1 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
      isDraggingRef.current = true;
      setDrawMode(false);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [onCellClick, config.panX, config.panY, config.zoom, gridState.width, gridState.height]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (drawMode && isDrawing) {
      const coords = getGridCoords(e);
      if (coords) onCellClick(coords.gridX, coords.gridY);
    } else if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      onCanvasDrag(deltaX, deltaY);
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  }, [onCellClick, onCanvasDrag, drawMode, isDrawing, config.panX, config.panY, config.zoom, gridState.width, gridState.height]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    isDraggingRef.current = false;
  }, []);

  // Prevent context menu on right click
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // Handle click to toggle cells (for single clicks)
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Only handle if not drawing (single click)
    if (!isDrawing && drawMode) {
      const coords = getGridCoords(e);
      if (coords) onCellClick(coords.gridX, coords.gridY);
    }
  }, [onCellClick, isDrawing, drawMode, config.panX, config.panY, config.zoom, gridState.width, gridState.height]);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    onZoom(delta);
  }, [onZoom]);

  // Set canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawGrid();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full bg-black cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      style={{ touchAction: 'none' }}
    />
  );
}; 