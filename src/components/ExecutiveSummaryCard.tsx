import React from 'react';
import { Sparkles, TrendingUp, Camera, FileText } from 'lucide-react';

interface ExecutiveSummaryCardProps {
  summary: string;
  fileAName: string;
  fileASummary?: string;
  fileBName: string;
  fileBSummary?: string;
  keyInsights: string[];
}

export const ExecutiveSummaryCard: React.FC<ExecutiveSummaryCardProps> = ({
  summary,
  fileAName,
  fileASummary,
  fileBName,
  fileBSummary,
  keyInsights,
}) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-300 shadow-md space-y-6 text-slate-800 font-sans">
      {/* Top Title Banner */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">Resumo Executivo do Estúdio</h2>
            <p className="text-xs text-slate-500">Síntese técnica de dados gerada por IA a partir da comparação dos dois arquivos</p>
          </div>
        </div>
      </div>

      {/* Main Narrative Paragraph */}
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs leading-relaxed font-normal">
        {summary}
      </div>

      {/* Side-by-side File Context Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {fileAName}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-semibold border border-slate-300">
              Arquivo A
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {fileASummary || 'Dados analisados do Arquivo A.'}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {fileBName}
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-semibold border border-slate-300">
              Arquivo B
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-normal">
            {fileBSummary || 'Dados analisados do Arquivo B.'}
          </p>
        </div>
      </div>

      {/* Key Insights List */}
      {keyInsights && keyInsights.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Principais Conclusões & Achados Técnicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {keyInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                  {idx + 1}
                </div>
                <span className="leading-normal">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
