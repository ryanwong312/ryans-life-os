import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { motion } from 'framer-motion';
import { 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  Type, 
  Eraser,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function InfiniteWhiteboard({ whiteboardData, onSave, noteId }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 2000,
      height: 2000,
      backgroundColor: '#ffffff',
      selection: activeTool === 'select',
      isDrawingMode: activeTool === 'pencil',
    });

    fabricCanvasRef.current = canvas;

    // Load existing data
    if (whiteboardData?.objects) {
      canvas.loadFromJSON(whiteboardData, () => {
        canvas.renderAll();
      });
    }

    // Set up drawing brush
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;

    // Handle object modifications for auto-save
    const handleModified = () => {
      saveState();
      autoSave();
    };

    canvas.on('object:added', handleModified);
    canvas.on('object:modified', handleModified);
    canvas.on('object:removed', handleModified);

    // Pan with mouse
    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (activeTool === 'pan' || evt.altKey || evt.shiftKey) {
        setIsPanning(true);
        setLastPanPoint({ x: evt.clientX, y: evt.clientY });
        canvas.selection = false;
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning && lastPanPoint) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPanPoint.x;
        vpt[5] += evt.clientY - lastPanPoint.y;
        canvas.requestRenderAll();
        setLastPanPoint({ x: evt.clientX, y: evt.clientY });
      }
    });

    canvas.on('mouse:up', () => {
      setIsPanning(false);
      setLastPanPoint(null);
      canvas.selection = true;
    });

    // Zoom with mouse wheel
    canvas.on('mouse:wheel', (opt) => {
      const delta = opt.e.deltaY;
      let newZoom = canvas.getZoom();
      newZoom *= 0.999 ** delta;
      if (newZoom > 10) newZoom = 10;
      if (newZoom < 0.1) newZoom = 0.1;
      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, newZoom);
      setZoom(newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  // Update tool settings
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = activeTool === 'pencil';
    canvas.selection = activeTool === 'select';

    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = brushSize;
      canvas.freeDrawingBrush.color = brushColor;
    }
  }, [activeTool, brushSize, brushColor]);

  const saveState = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const autoSave = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !onSave) return;

    const data = canvas.toJSON();
    onSave(data);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = fabricCanvasRef.current;
      const newStep = historyStep - 1;
      canvas.loadFromJSON(history[newStep], () => {
        canvas.renderAll();
        setHistoryStep(newStep);
      });
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = fabricCanvasRef.current;
      const newStep = historyStep + 1;
      canvas.loadFromJSON(history[newStep], () => {
        canvas.renderAll();
        setHistoryStep(newStep);
      });
    }
  };

  const addShape = (shapeType) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let shape;
    const centerX = canvas.width / 2 / zoom;
    const centerY = canvas.height / 2 / zoom;

    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
      case 'circle':
        shape = new fabric.Circle({
          left: centerX - 50,
          top: centerY - 50,
          radius: 50,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
      case 'triangle':
        shape = new fabric.Triangle({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
        break;
    }

    if (shape) {
      canvas.add(shape);
      canvas.setActiveObject(shape);
      saveState();
      autoSave();
    }
  };

  const addText = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const text = new fabric.IText('Type here...', {
      left: canvas.width / 2 / zoom - 50,
      top: canvas.height / 2 / zoom - 20,
      fontSize: 20,
      fill: brushColor,
      fontFamily: 'Arial',
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    text.enterEditing();
    saveState();
    autoSave();
  };

  const clearCanvas = () => {
    if (confirm('Clear entire whiteboard?')) {
      const canvas = fabricCanvasRef.current;
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      saveState();
      autoSave();
    }
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      saveState();
      autoSave();
    }
  };

  const zoomIn = () => {
    const canvas = fabricCanvasRef.current;
    const newZoom = Math.min(zoom * 1.2, 10);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const zoomOut = () => {
    const canvas = fabricCanvasRef.current;
    const newZoom = Math.max(zoom / 1.2, 0.1);
    canvas.setZoom(newZoom);
    setZoom(newZoom);
  };

  const exportPNG = () => {
    const canvas = fabricCanvasRef.current;
    const dataURL = canvas.toDataURL({ format: 'png', quality: 1 });
    const link = document.createElement('a');
    link.download = `whiteboard-${noteId}-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="whiteboard-container flex flex-col h-full">
      {/* Toolbar */}
      <div className="whiteboard-toolbar bg-slate-800/50 border-b border-slate-700 p-3">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Tool buttons */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={activeTool === 'select' ? 'default' : 'ghost'}
              onClick={() => setActiveTool('select')}
              className={activeTool === 'select' ? 'bg-teal-500' : ''}
            >
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'pan' ? 'default' : 'ghost'}
              onClick={() => setActiveTool('pan')}
              className={activeTool === 'pan' ? 'bg-teal-500' : ''}
            >
              <Move className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={activeTool === 'pencil' ? 'default' : 'ghost'}
              onClick={() => setActiveTool('pencil')}
              className={activeTool === 'pencil' ? 'bg-teal-500' : ''}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addShape('rectangle')}
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addShape('circle')}
            >
              <Circle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={addText}
            >
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          {/* Color & Size */}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
            <div className="flex items-center gap-2 min-w-32">
              <span className="text-xs text-slate-400">Size: {brushSize}px</span>
              <Slider
                value={[brushSize]}
                onValueChange={([value]) => setBrushSize(value)}
                min={1}
                max={50}
                step={1}
                className="w-20"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          {/* Actions */}
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={undo} disabled={historyStep <= 0}>
              <Undo className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={redo} disabled={historyStep >= history.length - 1}>
              <Redo className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          {/* Zoom */}
          <div className="flex gap-1 items-center">
            <Button size="sm" variant="ghost" onClick={zoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-400 min-w-16 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button size="sm" variant="ghost" onClick={zoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          <Button size="sm" variant="ghost" onClick={exportPNG}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="whiteboard-canvas-wrapper flex-1 overflow-auto bg-slate-900 p-4">
        <canvas ref={canvasRef} />
      </div>

      {/* Help text */}
      <div className="p-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-400">
        <span>💡 Tips: Alt/Shift + Drag to pan • Scroll to zoom • Delete key removes selected objects</span>
      </div>
    </div>
  );
}