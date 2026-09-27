import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Table as TableIcon } from 'lucide-react';

export interface ConsolidatedRow {
  id: string;
  item: string;
  valorA: string;
  valorB: string;
  diferenca: string;
  statusMatch: string;
}

interface ConsolidatedDataTableProps {
  rows: ConsolidatedRow[];
  fileAName: string;
  fileBName: string;
}

export const ConsolidatedDataTable: React.FC<ConsolidatedDataTableProps> = ({
  rows,
  fileAName,
  fileBName,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  if (!rows || rows.length === 0) return null;

  const filtered = rows.filter((r) => {
    const matchesSearch =
      r.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.valorA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.valorB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diferenca.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.statusMatch === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-300 shadow-md space-y-6 text-slate-800 font-sans">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-display">
            <TableIcon className="w-5 h-5 text-slate-700" />
            Tabela Consolidada & Reconciliada
          </h3>
          <p className="text-xs text-slate-500">
            Visão unificada linha a linha dos dados combinados do Arquivo A e B
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Pesquisar registro..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800 w-44"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-slate-800"
          >
            <option value="all">Todos os Status</option>
            <option value="Correspondente">Correspondentes</option>
            <option value="Divergente">Divergentes</option>
            <option value="Apenas no Arquivo A">Apenas no Arq A</option>
            <option value="Apenas no Arquivo B">Apenas no Arq B</option>
          </select>
        </div>
      </div>

      {/* Main Grid Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-300">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300">
            <tr>
              <th className="p-3.5 w-12 text-center text-slate-400">#</th>
              <th className="p-3.5">Item / Descrição</th>
              <th className="p-3.5 font-mono">{fileAName}</th>
              <th className="p-3.5 font-mono">{fileBName}</th>
              <th className="p-3.5 font-mono">Diferença / Variação</th>
              <th className="p-3.5 text-center">Status Reconciliação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {paginatedRows.map((row, idx) => {
              const globalIdx = (currentPage - 1) * pageSize + idx + 1;
              const isMatch = row.statusMatch?.toLowerCase().includes('correspondente');
              const isDivergent = row.statusMatch?.toLowerCase().includes('divergente');

              return (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 text-center text-slate-400 font-mono text-[11px]">{globalIdx}</td>
                  <td className="p-3.5 font-bold text-slate-900">{row.item}</td>
                  <td className="p-3.5 font-mono text-slate-800">{row.valorA || '-'}</td>
                  <td className="p-3.5 font-mono text-slate-800">{row.valorB || '-'}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-900">{row.diferenca || '-'}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isMatch
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : isDivergent
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {row.statusMatch}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum registro encontrado para os filtros aplicados.
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
          <div>
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, filtered.length)} a{' '}
            {Math.min(currentPage * pageSize, filtered.length)} de {filtered.length} registros
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-100 border border-slate-300 disabled:opacity-40 hover:bg-slate-200 transition-colors text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-900 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-slate-100 border border-slate-300 disabled:opacity-40 hover:bg-slate-200 transition-colors text-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
