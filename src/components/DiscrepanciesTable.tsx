import React, { useState } from 'react';
import { AlertTriangle, Search, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface DiscrepancyItem {
  item: string;
  fileADetail: string;
  fileBDetail: string;
  riskLevel: 'Alta' | 'Média' | 'Baixa' | string;
  recommendation: string;
}

interface DiscrepanciesTableProps {
  discrepancies: DiscrepancyItem[];
  fileAName: string;
  fileBName: string;
}

export const DiscrepanciesTable: React.FC<DiscrepanciesTableProps> = ({
  discrepancies,
  fileAName,
  fileBName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Alta' | 'Média' | 'Baixa'>('all');

  if (!discrepancies || discrepancies.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-300 space-y-2">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
        <h3 className="text-sm font-bold text-slate-900">Nenhuma Discrepância Relevante Detectada</h3>
        <p className="text-xs text-slate-500">Os dados dos dois arquivos apresentam forte alinhamento e consistência.</p>
      </div>
    );
  }

  const filtered = discrepancies.filter((d) => {
    const matchesSearch =
      d.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileADetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileBDetail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.recommendation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = riskFilter === 'all' || d.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-300 shadow-md space-y-6 text-slate-800 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Matriz de Discrepâncias & Divergências
          </h3>
          <p className="text-xs text-slate-500">
            Divergências identificadas entre {fileAName} e {fileBName}
          </p>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar divergência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 w-44"
            />
          </div>

          {/* Risk Filter Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setRiskFilter('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                riskFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({discrepancies.length})
            </button>
            <button
              onClick={() => setRiskFilter('Alta')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                riskFilter === 'Alta'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Alta
            </button>
            <button
              onClick={() => setRiskFilter('Média')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                riskFilter === 'Média'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Média
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300">
            <tr>
              <th className="p-3.5 w-1/4">Item / Registro</th>
              <th className="p-3.5 w-1/5">{fileAName}</th>
              <th className="p-3.5 w-1/5">{fileBName}</th>
              <th className="p-3.5 text-center">Nível de Risco</th>
              <th className="p-3.5">Recomendação da IA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filtered.map((row, idx) => {
              const isHigh = row.riskLevel === 'Alta';
              const isMedium = row.riskLevel === 'Média';

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 font-sans">{row.item}</td>
                  <td className="p-3.5 font-mono text-slate-800">{row.fileADetail}</td>
                  <td className="p-3.5 font-mono text-slate-800">{row.fileBDetail}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isHigh
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : isMedium
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isHigh && <ShieldAlert className="w-3 h-3" />}
                      {row.riskLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 leading-relaxed font-sans">{row.recommendation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500">
            Nenhuma divergência corresponde ao filtro selecionado.
          </div>
        )}
      </div>
    </div>
  );
};
