import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { motion } from 'framer-motion';
import { 
  MousePointer, Pencil, Square, Circle, Type, Triangle, ArrowRight,
  Undo, Redo, ZoomIn, ZoomOut, Move, Trash2, Download, Maximize2, Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function EnhancedWhiteboard({ whiteboardData, onSave, noteId }) {
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const [activeTool, setActiveTool] = useState('select');
  const [brushSize, setBrushSize] = useState(3);
  const [brushColor, setBrushColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [creationState, setCreationState] = useState({ isCreating: false, startPoint: null, previewObject: null });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: isFullscreen ? window.innerWidth : 2000,
      height: isFullscreen ? window.innerHeight : 2000,
      backgroundColor: '#ffffff',
      selection: activeTool === 'select',
      isDrawingMode: activeTool === 'pencil',
    });

    fabricCanvasRef.current = canvas;

    if (whiteboardData?.objects) {
      canvas.loadFromJSON(whiteboardData, () => canvas.renderAll());
    }

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.width = brushSize;
    canvas.freeDrawingBrush.color = brushColor;

    const handleModified = () => {
      saveState();
      if (onSave) {
        const data = canvas.toJSON();
        onSave(data);
      }
    };

    canvas.on('object:added', handleModified);
    canvas.on('object:modified', handleModified);
    canvas.on('object:removed', handleModified);

    // Pan with Alt/Shift + drag
    let isPanning = false;
    let lastPanPoint = null;

    canvas.on('mouse:down', (opt) => {
      const evt = opt.e;
      if (activeTool === 'pan' || evt.altKey || evt.shiftKey) {
        isPanning = true;
        lastPanPoint = { x: evt.clientX, y: evt.clientY };
        canvas.selection = false;
      } else if (['rectangle', 'circle', 'triangle', 'arrow'].includes(activeTool)) {
        handleShapeCreationStart(opt);
      }
    });

    canvas.on('mouse:move', (opt) => {
      if (isPanning && lastPanPoint) {
        const evt = opt.e;
        const vpt = canvas.viewportTransform;
        vpt[4] += evt.clientX - lastPanPoint.x;
        vpt[5] += evt.clientY - lastPanPoint.y;
        canvas.requestRenderAll();
        lastPanPoint = { x: evt.clientX, y: evt.clientY };
      } else if (creationState.isCreating && creationState.previewObject) {
        handleShapeCreationMove(opt);
      }
    });

    canvas.on('mouse:up', () => {
      isPanning = false;
      lastPanPoint = null;
      canvas.selection = true;
      
      if (creationState.isCreating) {
        handleShapeCreationEnd();
      }
    });

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

    return () => canvas.dispose();
  }, [isFullscreen]);

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

  const handleShapeCreationStart = (opt) => {
    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(opt.e);
    
    let previewObject = null;

    switch (activeTool) {
      case 'rectangle':
        previewObject = new fabric.Rect({
          left: pointer.x, top: pointer.y, width: 1, height: 1,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
          strokeDashArray: [5, 5], selectable: false
        });
        break;
      case 'circle':
        previewObject = new fabric.Circle({
          left: pointer.x, top: pointer.y, radius: 1,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
          strokeDashArray: [5, 5], selectable: false
        });
        break;
      case 'triangle':
        previewObject = new fabric.Triangle({
          left: pointer.x, top: pointer.y, width: 1, height: 1,
          fill: 'transparent', stroke: brushColor, strokeWidth: 2,
          strokeDashArray: [5, 5], selectable: false
        });
        break;
      case 'arrow':
        previewObject = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: brushColor, strokeWidth: 2,
          strokeDashArray: [5, 5], selectable: false
        });
        break;
    }

    if (previewObject) {
      canvas.add(previewObject);
      setCreationState({ isCreating: true, startPoint: pointer, previewObject });
    }
  };

  const handleShapeCreationMove = (opt) => {
    const canvas = fabricCanvasRef.current;
    const pointer = canvas.getPointer(opt.e);
    const { startPoint, previewObject } = creationState;

    if (!previewObject || !startPoint) return;

    switch (activeTool) {
      case 'rectangle':
      case 'triangle':
        previewObject.set({
          left: Math.min(startPoint.x, pointer.x),
          top: Math.min(startPoint.y, pointer.y),
          width: Math.abs(pointer.x - startPoint.x),
          height: Math.abs(pointer.y - startPoint.y),
        });
        break;
      case 'circle':
        const radius = Math.sqrt(Math.pow(pointer.x - startPoint.x, 2) + Math.pow(pointer.y - startPoint.y, 2)) / 2;
        previewObject.set({
          left: startPoint.x - radius,
          top: startPoint.y - radius,
          radius: radius,
        });
        break;
      case 'arrow':
        previewObject.set({ x2: pointer.x, y2: pointer.y });
        break;
    }

    canvas.renderAll();
  };

  const handleShapeCreationEnd = () => {
    const canvas = fabricCanvasRef.current;
    const { previewObject } = creationState;

    if (previewObject) {
      canvas.remove(previewObject);
      
      // Create final shape
      let finalShape = null;
      
      if (activeTool === 'rectangle') {
        finalShape = new fabric.Rect({
          left: previewObject.left,
          top: previewObject.top,
          width: previewObject.width,
          height: previewObject.height,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
      } else if (activeTool === 'circle') {
        finalShape = new fabric.Circle({
          left: previewObject.left,
          top: previewObject.top,
          radius: previewObject.radius,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
      } else if (activeTool === 'triangle') {
        finalShape = new fabric.Triangle({
          left: previewObject.left,
          top: previewObject.top,
          width: previewObject.width,
          height: previewObject.height,
          fill: fillColor,
          stroke: brushColor,
          strokeWidth: 2,
        });
      } else if (activeTool === 'arrow') {
        const line = new fabric.Line([previewObject.x1, previewObject.y1, previewObject.x2, previewObject.y2], {
          stroke: brushColor,
          strokeWidth: 2,
        });
        const angle = Math.atan2(previewObject.y2 - previewObject.y1, previewObject.x2 - previewObject.x1) * (180 / Math.PI);
        const arrowhead = new fabric.Triangle({
          left: previewObject.x2,
          top: previewObject.y2,
          width: 15,
          height: 15,
          fill: brushColor,
          angle: angle + 90,
          originX: 'center',
          originY: 'center',
        });
        finalShape = new fabric.Group([line, arrowhead]);
      }

      if (finalShape) {
        canvas.add(finalShape);
        canvas.setActiveObject(finalShape);
        saveState();
      }
    }

    setCreationState({ isCreating: false, startPoint: null, previewObject: null });
  };

  const saveState = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const json = JSON.stringify(canvas.toJSON());
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(json);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
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
  };

  const clearCanvas = () => {
    if (confirm('Clear entire whiteboard?')) {
      const canvas = fabricCanvasRef.current;
      canvas.clear();
      canvas.backgroundColor = '#ffffff';
      saveState();
    }
  };

  const deleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      canvas.remove(...activeObjects);
      canvas.discardActiveObject();
      saveState();
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

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div ref={containerRef} className={`whiteboard-container flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : 'h-full'}`}>
      <div className="whiteboard-toolbar bg-slate-800/50 border-b border-slate-700 p-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex gap-1">
            <Button size="sm" variant={activeTool === 'select' ? 'default' : 'ghost'} onClick={() => setActiveTool('select')} className={activeTool === 'select' ? 'bg-teal-500' : ''}>
              <MousePointer className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'pan' ? 'default' : 'ghost'} onClick={() => setActiveTool('pan')} className={activeTool === 'pan' ? 'bg-teal-500' : ''}>
              <Move className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'pencil' ? 'default' : 'ghost'} onClick={() => setActiveTool('pencil')} className={activeTool === 'pencil' ? 'bg-teal-500' : ''}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'rectangle' ? 'default' : 'ghost'} onClick={() => setActiveTool('rectangle')} className={activeTool === 'rectangle' ? 'bg-teal-500' : ''}>
              <Square className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'circle' ? 'default' : 'ghost'} onClick={() => setActiveTool('circle')} className={activeTool === 'circle' ? 'bg-teal-500' : ''}>
              <Circle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'triangle' ? 'default' : 'ghost'} onClick={() => setActiveTool('triangle')} className={activeTool === 'triangle' ? 'bg-teal-500' : ''}>
              <Triangle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant={activeTool === 'arrow' ? 'default' : 'ghost'} onClick={() => setActiveTool('arrow')} className={activeTool === 'arrow' ? 'bg-teal-500' : ''}>
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={addText}>
              <Type className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Stroke</label>
              <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-400">Fill</label>
              <input type="color" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </div>
            <div className="flex items-center gap-2 min-w-32">
              <span className="text-xs text-slate-400">Size: {brushSize}px</span>
              <Slider value={[brushSize]} onValueChange={([value]) => setBrushSize(value)} min={1} max={50} step={1} className="w-20" />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={undo} disabled={historyStep <= 0}><Undo className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={redo} disabled={historyStep >= history.length - 1}><Redo className="w-4 h-4" /></Button>
            <Button size="sm" variant="ghost" onClick={deleteSelected}><Trash2 className="w-4 h-4" /></Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          <div className="flex gap-1 items-center">
            <Button size="sm" variant="ghost" onClick={zoomOut}><ZoomOut className="w-4 h-4" /></Button>
            <span className="text-xs text-slate-400 min-w-16 text-center">{Math.round(zoom * 100)}%</span>
            <Button size="sm" variant="ghost" onClick={zoomIn}><ZoomIn className="w-4 h-4" /></Button>
          </div>

          <div className="h-6 w-px bg-slate-600" />

          <Button size="sm" variant="ghost" onClick={exportPNG}><Download className="w-4 h-4" /></Button>
          <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={clearCanvas}><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="whiteboard-canvas-wrapper flex-1 overflow-auto bg-slate-900 p-4">
        <canvas ref={canvasRef} />
      </div>

      <div className="p-2 bg-slate-800/50 border-t border-slate-700 text-xs text-slate-400">
        <span>💡 {creationState.isCreating ? 'Drag to resize, release to create' : 'Alt/Shift + Drag to pan • Scroll to zoom • Delete key removes selected'}</span>
      </div>
    </div>
  );
}