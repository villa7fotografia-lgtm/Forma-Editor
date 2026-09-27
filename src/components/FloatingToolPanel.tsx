import React, { useState } from 'react';
import {
  Minimize2,
  Maximize2,
  X,
  Move,
  ChevronDown,
  ChevronUp,
  PanelRight,
  PanelLeft,
} from 'lucide-react';

interface FloatingToolPanelProps {
  title: string;
  icon?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: 'right' | 'left';
  badge?: string;
  className?: string;
}

export const FloatingToolPanel: React.FC<FloatingToolPanelProps> = ({
  title,
  icon,
  isOpen,
  onClose,
  children,
  initialPosition = 'right',
  badge,
  className = '',
}) => {
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [dockPosition, setDockPosition] = useState<'right' | 'left'>(initialPosition);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-40 transition-all duration-300 ease-in-out font-sans ${
        dockPosition === 'right' ? 'right-4' : 'left-4'
      } ${
        isMaximized
          ? 'top-20 bottom-24 w-[92vw] max-w-2xl sm:w-[500px]'
          : isMinimized
          ? 'bottom-24 w-72 h-12 overflow-hidden'
          : 'top-20 bottom-24 w-[90vw] sm:w-[420px]'
      } ${className}`}
    >
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden text-zinc-100 ring-1 ring-white/10">
        {/* Floating Panel Header Bar */}
        <div className="bg-zinc-950/90 px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0 select-none">
          <div className="flex items-center gap-2.5 truncate">
            {icon && (
              <div className="w-7 h-7 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow">
                {icon}
              </div>
            )}
            <div className="truncate">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider font-display flex items-center gap-2 truncate">
                {title}
                {badge && (
                  <span className="text-[9px] font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded-full uppercase shrink-0">
                    {badge}
                  </span>
                )}
              </h3>
            </div>
          </div>

          {/* Window Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Dock Left / Right Switcher */}
            <button
              onClick={() => setDockPosition(dockPosition === 'right' ? 'left' : 'right')}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title={`Mover para o lado ${dockPosition === 'right' ? 'esquerdo' : 'direito'}`}
            >
              {dockPosition === 'right' ? (
                <PanelLeft className="w-3.5 h-3.5" />
              ) : (
                <PanelRight className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Minimize / Collapse Toggle */}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title={isMinimized ? 'Expandir painel' : 'Recolher painel flutuante'}
            >
              {isMinimized ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Maximize Toggle */}
            {!isMinimized && (
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title={isMaximized ? 'Restaurar tamanho' : 'Maximizar painel'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors ml-1"
              title="Fechar janela de ferramenta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Panel Content Body */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
