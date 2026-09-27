import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface ConsolidatedMetric {
  metric: string;
  valA: string;
  valB: string;
  variance: string;
  trend?: 'up' | 'down' | 'neutral' | string;
  status?: 'normal' | 'warning' | 'alert' | string;
}

interface MetricsGridProps {
  metrics: ConsolidatedMetric[];
  fileAName: string;
  fileBName: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, fileAName, fileBName }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="space-y-3 font-sans">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Indicadores Chave & Métricas Comparativas
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          {metrics.length} métricas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item, idx) => {
          const isAlert = item.status === 'alert';
          const isWarning = item.status === 'warning';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl bg-white border shadow-sm transition-all space-y-3 ${
                isAlert
                  ? 'border-red-300 bg-red-50/50'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-bold text-slate-800 truncate" title={item.metric}>
                  {item.metric}
                </p>
                {isAlert ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 shrink-0">
                    Atenção
                  </span>
                ) : isWarning ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                    Alerta
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    Normal
                  </span>
                )}
              </div>

              {/* Side-by-side values */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 font-mono">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase truncate" title={fileAName}>
                    Arq A ({fileAName.slice(0, 10)}...)
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.valA}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] text-slate-500 uppercase truncate" title={fileBName}>
                    Arq B ({fileBName.slice(0, 10)}...)
                  </div>
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.valB}
                  </div>
                </div>
              </div>

              {/* Variance Indicator */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500 text-[11px]">Variação:</span>
                <span
                  className={`flex items-center gap-1 font-mono text-xs ${
                    item.trend === 'up'
                      ? 'text-emerald-700 font-bold'
                      : item.trend === 'down'
                      ? 'text-amber-700 font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {item.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {item.trend === 'down' && <ArrowDownRight className="w-3.5 h-3.5" />}
                  {item.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  {item.variance}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
