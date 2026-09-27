import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Wand2,
  Eraser,
  Check,
  Loader2,
  Undo2,
  Brush,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  RotateCcw,
  Eye,
  Sliders,
  Sparkles,
  Layers,
  Compass,
  Stamp,
  ShieldCheck,
} from 'lucide-react';
import { processObjectRemoval, InpaintingOptions } from '../utils/inpaintingEngine';

interface ObjectRemoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  photoName: string;
  onApplyEditedPhoto: (newPhotoUrl: string) => void;
}

export const ObjectRemoverModal: React.FC<ObjectRemoverModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  photoName,
  onApplyEditedPhoto,
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Tools state
  const [activeTool, setActiveTool] = useState<'brush' | 'pan'>('brush');
  const [removalMode, setRemovalMode] = useState<'heal' | 'clone'>('heal');
  const [sampleDirection, setSampleDirection] = useState<'auto' | 'horizontal' | 'vertical' | 'above' | 'below'>('auto');
  const [brushSize, setBrushSize] = useState<number>(28);
  const [feather, setFeather] = useState<number>(40);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'high'>('high');

  // Mouse & Touch Pan / Draw state
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  const [currentResultUrl, setCurrentResultUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [showOriginalComparison, setShowOriginalComparison] = useState(false);

  // Track original dimensions
  const imageDimsRef = useRef<{ width: number; height: number }>({ width: 1920, height: 1080 });

  // Initialize Canvas when modal opens or photo changes
  useEffect(() => {
    if (!isOpen || !photoUrl) return;

    setCurrentResultUrl(null);
    setHasMask(false);
    setHistory([]);
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
    setShowOriginalComparison(false);

    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      baseImageRef.current = img;

      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      imageDimsRef.current = { width: naturalW, height: naturalH };

      // Maintain high working resolution up to 2560px for sharp retina fidelity
      const maxWorkDim = 2560;
      let w = naturalW;
      let h = naturalH;

      if (w > maxWorkDim || h > maxWorkDim) {
        if (w > h) {
          h = Math.round((h * maxWorkDim) / w);
          w = maxWorkDim;
        } else {
          w = Math.round((w * maxWorkDim) / h);
          h = maxWorkDim;
        }
      }

      displayCanvas.width = w;
      displayCanvas.height = h;

      // Initialize offscreen mask canvas at exact matching resolution
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      maskCanvasRef.current = maskCanvas;

      // Draw base image onto display canvas
      const ctx = displayCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
      }

      // Save initial clean mask snapshot
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        const cleanMask = maskCtx.getImageData(0, 0, w, h);
        setHistory([cleanMask]);
      }
    };

    img.src = photoUrl;
  }, [isOpen, photoUrl]);

  if (!isOpen) return null;

  // Coordinate Conversion with Zoom & Pan scaling
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === 'pan') {
      setIsPanning(true);
      let clientX = 0, clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      setStartPan({ x: clientX - panOffset.x, y: clientY - panOffset.y });
    } else {
      setIsDrawing(true);
      const coords = getCanvasCoords(e);
      lastPointRef.current = coords;
      drawStroke(coords.x, coords.y, coords.x, coords.y);
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      let clientX = 0, clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      setPanOffset({
        x: clientX - startPan.x,
        y: clientY - startPan.y,
      });
    } else if (isDrawing) {
      const coords = getCanvasCoords(e);
      const prev = lastPointRef.current || coords;
      drawStroke(prev.x, prev.y, coords.x, coords.y);
      lastPointRef.current = coords;
    }
  };

  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing && maskCanvasRef.current) {
      setIsDrawing(false);
      lastPointRef.current = null;
      const maskCtx = maskCanvasRef.current.getContext('2d');
      if (maskCtx) {
        const snap = maskCtx.getImageData(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        setHistory((prev) => [...prev, snap]);
        setHasMask(true);
      }
    }
  };

  // Continuous stroke drawing with smooth caps
  const drawStroke = (fromX: number, fromY: number, toX: number, toY: number) => {
    const displayCanvas = displayCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!displayCanvas || !maskCanvas) return;

    const scaledBrushSize = brushSize * (displayCanvas.width / 900);

    // 1. Draw solid stroke on offscreen mask canvas
    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.strokeStyle = 'rgba(255, 0, 0, 1.0)';
      maskCtx.fillStyle = 'rgba(255, 0, 0, 1.0)';
      maskCtx.lineWidth = scaledBrushSize;
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';

      maskCtx.beginPath();
      maskCtx.moveTo(fromX, fromY);
      maskCtx.lineTo(toX, toY);
      maskCtx.stroke();
    }

    // 2. Render overlay onto display canvas
    const displayCtx = displayCanvas.getContext('2d');
    if (displayCtx) {
      displayCtx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
      displayCtx.fillStyle = 'rgba(239, 68, 68, 0.65)';
      displayCtx.lineWidth = scaledBrushSize;
      displayCtx.lineCap = 'round';
      displayCtx.lineJoin = 'round';

      displayCtx.beginPath();
      displayCtx.moveTo(fromX, fromY);
      displayCtx.lineTo(toX, toY);
      displayCtx.stroke();
    }

    setHasMask(true);
  };

  const redrawDisplayCanvas = (img: HTMLImageElement, maskCanvas: HTMLCanvasElement | null) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;

    const ctx = displayCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
    ctx.drawImage(img, 0, 0, displayCanvas.width, displayCanvas.height);

    if (maskCanvas) {
      const maskCtx = maskCanvas.getContext('2d');
      if (maskCtx) {
        const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
        const displayData = ctx.getImageData(0, 0, displayCanvas.width, displayCanvas.height);

        for (let i = 0; i < maskData.data.length; i += 4) {
          if (maskData.data[i + 3] > 0 || maskData.data[i] > 50) {
            displayData.data[i] = Math.round(displayData.data[i] * 0.4 + 239 * 0.6);
            displayData.data[i + 1] = Math.round(displayData.data[i + 1] * 0.4 + 68 * 0.6);
            displayData.data[i + 2] = Math.round(displayData.data[i + 2] * 0.4 + 68 * 0.6);
          }
        }
        ctx.putImageData(displayData, 0, 0);
      }
    }
  };

  const handleClearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      const cleanSnap = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
      setHistory([cleanSnap]);
      setHasMask(false);
    }

    if (baseImageRef.current) {
      redrawDisplayCanvas(baseImageRef.current, null);
    }
  };

  const handleUndo = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || history.length <= 1) return;

    const newHistory = history.slice(0, history.length - 1);
    const lastSnap = newHistory[newHistory.length - 1];

    const maskCtx = maskCanvas.getContext('2d');
    if (maskCtx) {
      maskCtx.putImageData(lastSnap, 0, 0);
      setHistory(newHistory);
      if (newHistory.length === 1) {
        setHasMask(false);
      }
    }

    if (baseImageRef.current) {
      redrawDisplayCanvas(baseImageRef.current, maskCanvas);
    }
  };

  // Run Professional Inpainting Engine
  const handleProcessRemoval = async () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas || !hasMask) return;

    setIsProcessing(true);

    try {
      const options: InpaintingOptions = {
        mode: removalMode,
        sampleDirection,
        feather,
        lamaQuality: quality,
      };

      const resultUrl = await processObjectRemoval(
        currentResultUrl || photoUrl,
        maskCanvas,
        options
      );

      setCurrentResultUrl(resultUrl);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        baseImageRef.current = img;

        const displayCanvas = displayCanvasRef.current;
        if (displayCanvas) {
          const ctx = displayCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, displayCanvas.width, displayCanvas.height);
          }
        }

        if (maskCanvas) {
          const maskCtx = maskCanvas.getContext('2d');
          if (maskCtx) {
            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            const cleanSnap = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
            setHistory([cleanSnap]);
          }
        }
        setHasMask(false);
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
      };
      img.src = resultUrl;
    } catch (err) {
      console.error('Erro ao processar remoção:', err);
      setIsProcessing(false);
    }
  };

  const handleConfirmApply = () => {
    if (currentResultUrl) {
      onApplyEditedPhoto(currentResultUrl);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 font-sans text-zinc-100">
      <div className="bg-zinc-900 sm:border sm:border-zinc-800 sm:rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col h-[100dvh] sm:h-auto sm:max-h-[96vh] overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-950 px-4 sm:px-5 py-3 border-b border-zinc-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Official Project Logo em Destaque */}
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-700/80 p-1 flex items-center justify-center shadow-lg ring-1 ring-white/10 overflow-hidden shrink-0">
              <img src="/logo_white.png" alt="Logomarca Oficial" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-white font-display tracking-tight flex items-center gap-1.5 sm:gap-2 truncate">
                <span>Motor de Remoção Profissional</span>
                <span className="hidden sm:inline text-[9px] bg-zinc-800 text-zinc-300 font-mono px-2 py-0.5 rounded border border-zinc-700">
                  {imageDimsRef.current.width} × {imageDimsRef.current.height}px
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                Poisson Texture Fusion · Preservação de grão e iluminação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Before / After toggle */}
            {currentResultUrl && (
              <button
                onMouseDown={() => {
                  setShowOriginalComparison(true);
                  if (displayCanvasRef.current) {
                    const ctx = displayCanvasRef.current.getContext('2d');
                    const origImg = new Image();
                    origImg.crossOrigin = 'anonymous';
                    origImg.onload = () => {
                      ctx?.drawImage(origImg, 0, 0, displayCanvasRef.current!.width, displayCanvasRef.current!.height);
                    };
                    origImg.src = photoUrl;
                  }
                }}
                onMouseUp={() => {
                  setShowOriginalComparison(false);
                  if (baseImageRef.current && displayCanvasRef.current) {
                    const ctx = displayCanvasRef.current.getContext('2d');
                    ctx?.drawImage(baseImageRef.current, 0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
                  }
                }}
                onTouchStart={() => {
                  setShowOriginalComparison(true);
                  if (displayCanvasRef.current) {
                    const ctx = displayCanvasRef.current.getContext('2d');
                    const origImg = new Image();
                    origImg.crossOrigin = 'anonymous';
                    origImg.onload = () => {
                      ctx?.drawImage(origImg, 0, 0, displayCanvasRef.current!.width, displayCanvasRef.current!.height);
                    };
                    origImg.src = photoUrl;
                  }
                }}
                onTouchEnd={() => {
                  setShowOriginalComparison(false);
                  if (baseImageRef.current && displayCanvasRef.current) {
                    const ctx = displayCanvasRef.current.getContext('2d');
                    ctx?.drawImage(baseImageRef.current, 0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
                  }
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center gap-1.5 transition-all select-none border ${
                  showOriginalComparison
                    ? 'bg-white text-zinc-950 border-white shadow'
                    : 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                }`}
                title="Segure para comparar com a foto original antes da remoção"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showOriginalComparison ? 'Original' : 'Comparar'}</span>
              </button>
            )}

            {/* BOTÃO PRINCIPAL DE CONFIRMAÇÃO DA EDIÇÃO (Visível diretamente no cabeçalho - Preto, Branco e Cinza) */}
            <button
              onClick={handleConfirmApply}
              disabled={!currentResultUrl}
              className={`px-3 sm:px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xl cursor-pointer ${
                currentResultUrl
                  ? 'bg-white hover:bg-zinc-200 text-zinc-950 ring-2 ring-white/50'
                  : 'bg-zinc-800/80 text-zinc-500 border border-zinc-800 cursor-not-allowed'
              }`}
              title={currentResultUrl ? "Confirmar e salvar edição na foto" : "Faça uma remoção primeiro para confirmar"}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirmar Edição</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toolbar Controls */}
        <div className="absolute top-20 left-4 z-40 bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md p-2 rounded-2xl flex flex-col gap-2 ring-1 ring-white/10">
          {/* Tool Mode (Brush vs Pan) */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setActiveTool('brush')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                activeTool === 'brush' ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Brush className="w-3.5 h-3.5" /> Pincel
            </button>
            <button
              onClick={() => setActiveTool('pan')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                activeTool === 'pan' ? 'bg-zinc-100 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hand className="w-3.5 h-3.5" /> Mão
            </button>
          </div>

          {/* LaMa Quality Controls */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {['fast', 'balanced', 'high'].map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] uppercase ${
                  quality === q ? 'bg-white text-zinc-950' : 'text-zinc-400'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
          
          {/* Removal Algorithm Mode */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setRemovalMode('heal')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                removalMode === 'heal'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Recuperação inteligente: Copia textura autêntica e adapta a iluminação e cor perfeitamente"
            >
              <Sparkles className="w-3.5 h-3.5" /> Recuperar (Heal)
            </button>

            <button
              onClick={() => setRemovalMode('clone')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all ${
                removalMode === 'clone'
                  ? 'bg-zinc-100 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Carimbo direto de textura com transição suave"
            >
              <Stamp className="w-3.5 h-3.5" /> Carimbo (Clone)
            </button>
          </div>

          {/* Sampling Direction */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-1">
              <Compass className="w-3 h-3 text-zinc-400" /> Amostra:
            </span>
            <select
              value={sampleDirection}
              onChange={(e) => setSampleDirection(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 text-white rounded-lg px-2.5 py-1 text-[11px] font-semibold focus:outline-none focus:border-zinc-500"
            >
              <option value="auto">Automático (Melhor Textura)</option>
              <option value="horizontal">Horizontal (Fios Verticais)</option>
              <option value="vertical">Vertical (Fios Horizontais)</option>
              <option value="above">De Cima (Superior)</option>
              <option value="below">De Baixo (Inferior)</option>
            </select>
          </div>

          {/* Brush Size Slider */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
              Tamanho:
            </span>
            <input
              type="range"
              min="6"
              max="120"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-20 accent-zinc-100 h-1.5 bg-zinc-800 rounded cursor-pointer"
            />
            <span className="font-mono text-white font-bold text-[11px] w-6">{brushSize}px</span>
          </div>

          {/* Feather Slider */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
              Suavidade:
            </span>
            <input
              type="range"
              min="10"
              max="90"
              value={feather}
              onChange={(e) => setFeather(Number(e.target.value))}
              className="w-16 accent-zinc-100 h-1.5 bg-zinc-800 rounded cursor-pointer"
              title="Suavização da borda de transição"
            />
            <span className="font-mono text-white font-bold text-[11px] w-6">{feather}%</span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setZoomScale((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-[11px] font-bold text-white px-1 w-10 text-center">
              {Math.round(zoomScale * 100)}%
            </span>

            <button
              onClick={() => setZoomScale((z) => Math.min(3.5, z + 0.25))}
              className="p-1 hover:bg-zinc-800 text-zinc-300 rounded transition-colors"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setZoomScale(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="px-1.5 py-0.5 text-[10px] text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded transition-colors font-semibold"
              title="Ajustar à Tela"
            >
              100%
            </button>
          </div>

          {/* Undo & Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={history.length <= 1}
              className="px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30 flex items-center gap-1 font-bold text-[11px] hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" /> Desfazer
            </button>

            <button
              onClick={handleClearMask}
              disabled={!hasMask}
              className="px-2.5 py-1.5 text-zinc-300 hover:text-white disabled:opacity-30 flex items-center gap-1 font-bold text-[11px] hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Eraser className="w-3.5 h-3.5" /> Limpar
            </button>
          </div>

          {/* Action Trigger & Confirmation */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleProcessRemoval}
              disabled={!hasMask || isProcessing}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-40 rounded-xl font-bold text-xs shadow flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  Fusão de Textura...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-zinc-950" />
                  Remover com Fidelidade
                </>
              )}
            </button>

            {/* Direct Confirmation in Toolbar when Edit is Done (Preto, Branco e Cinza) */}
            {currentResultUrl && (
              <button
                onClick={handleConfirmApply}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-black text-xs shadow-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ring-2 ring-white/50"
                title="Confirmar e salvar edição na foto"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Confirmar Edição
              </button>
            )}
          </div>
        </div>

        {/* Interactive Canvas Workspace with Zoom & Pan */}
        <div
          ref={containerRef}
          className="flex-1 bg-zinc-950 p-2 sm:p-4 flex items-center justify-center relative overflow-hidden select-none min-h-0"
        >
          {/* Floating Confirmation Banner When Edit is Ready (Preto, Branco e Cinza) */}
          {currentResultUrl && !isProcessing && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-zinc-900/95 border border-zinc-700 shadow-2xl backdrop-blur-md px-3.5 py-1.5 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-200 ring-1 ring-white/10">
              <div className="flex items-center gap-1.5 text-zinc-100 text-xs font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                <span>Edição realizada com sucesso!</span>
              </div>
              <button
                onClick={handleConfirmApply}
                className="px-3.5 py-1 bg-white hover:bg-zinc-200 text-zinc-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Confirmar Edição
              </button>
            </div>
          )}

          <div
            className="transition-transform duration-75 ease-out touch-none flex items-center justify-center max-w-full max-h-full"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              cursor: activeTool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair',
            }}
          >
            <canvas
              ref={displayCanvasRef}
              onMouseDown={handlePointerDown}
              onMouseUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onMouseMove={handlePointerMove}
              onTouchStart={handlePointerDown}
              onTouchEnd={handlePointerUp}
              onTouchMove={handlePointerMove}
              className="max-w-full max-h-[50vh] sm:max-h-[62vh] object-contain rounded-lg border border-zinc-800 shadow-2xl"
            />
          </div>

          {/* Overlay Helper Tag */}
          <div className="absolute bottom-3 left-3 sm:left-5 bg-zinc-900/90 text-white text-[10px] sm:text-[11px] font-bold px-3 py-1.5 rounded-lg border border-zinc-800 backdrop-blur-md pointer-events-none flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-zinc-300 animate-pulse"></span>
            {activeTool === 'brush'
              ? 'Pinte sobre manchas, fios ou objetos para fusão de textura'
              : 'Clique e arraste a imagem para navegar (Pan)'}
          </div>
        </div>

        {/* Footer Actions - Always Sticky & Fully Visible */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 truncate">
            <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0" />
            <span className="truncate">Resolução nativa · Sem borrão de pixel · Poisson Texture Fusion</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              onClick={handleConfirmApply}
              disabled={!currentResultUrl}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 font-black text-xs rounded-xl shadow-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                currentResultUrl
                  ? 'bg-white hover:bg-zinc-200 text-zinc-950 ring-2 ring-white/50'
                  : 'bg-zinc-800 text-zinc-500 disabled:opacity-40 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Confirmar Edição na Foto</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
