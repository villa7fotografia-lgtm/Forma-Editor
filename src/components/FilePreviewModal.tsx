import React from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { ParsedFileResult } from '../utils/fileParser';

interface FilePreviewModalProps {
  file: ParsedFileResult | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl font-sans text-slate-800">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">{file.name}</h3>
              <p className="text-xs text-slate-500">
                {file.rowCount} registros · {file.headers.length} colunas · Formato {file.format.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-auto flex-1 space-y-4">
          {file.rows && file.rows.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-300">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-300 sticky top-0">
                  <tr>
                    <th className="p-3 w-12 text-center text-slate-400">#</th>
                    {file.headers.map((h, i) => (
                      <th key={i} className="p-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-mono">
                  {file.rows.slice(0, 50).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-sans text-[11px]">{rIdx + 1}</td>
                      {file.headers.map((h, cIdx) => (
                        <td key={cIdx} className="p-3 whitespace-nowrap max-w-xs truncate text-slate-800">
                          {row[h] !== undefined ? String(row[h]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {file.rows.length > 50 && (
                <div className="p-3 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-200 font-sans">
                  Exibindo as primeiras 50 de {file.rows.length} linhas.
                </div>
              )}
            </div>
          ) : (
            <pre className="p-4 bg-slate-50 rounded-lg border border-slate-300 text-xs text-slate-800 font-mono overflow-auto max-h-[500px]">
              {file.rawContent}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
