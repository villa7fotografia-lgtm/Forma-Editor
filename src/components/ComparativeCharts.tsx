import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { BarChart2, LineChart as LineChartIcon } from 'lucide-react';

export interface ChartDataItem {
  category: string;
  arquivoA: number;
  arquivoB: number;
  variacaoPct?: number;
}

interface ComparativeChartsProps {
  chartData: ChartDataItem[];
  fileAName: string;
  fileBName: string;
}

export const ComparativeCharts: React.FC<ComparativeChartsProps> = ({
  chartData,
  fileAName,
  fileBName,
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-300 text-slate-500 text-xs">
        Nenhum dado numérico disponível para renderizar os gráficos comparativos.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-300 shadow-md space-y-6 text-slate-800 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">Gráficos Comparativos Consolidado</h3>
          <p className="text-xs text-slate-500">
            Comparativo direto de valores entre {fileAName} e {fileBName}
          </p>
        </div>

        {/* Toggle Chart Type */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300 self-start sm:self-auto">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              chartType === 'bar'
                ? 'bg-slate-900 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Barras
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 ${
              chartType === 'line'
                ? 'bg-slate-900 text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" /> Linhas
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#475569', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-slate-700 font-semibold">
                    {value === 'arquivoA' ? fileAName : fileBName}
                  </span>
                )}
              />
              <Bar dataKey="arquivoA" fill="#334155" radius={[4, 4, 0, 0]} name="arquivoA" />
              <Bar dataKey="arquivoB" fill="#0284c7" radius={[4, 4, 0, 0]} name="arquivoB" />
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                stroke="#64748b"
                tick={{ fill: '#475569', fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis stroke="#64748b" tick={{ fill: '#475569', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '8px',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => (
                  <span className="text-slate-700 font-semibold">
                    {value === 'arquivoA' ? fileAName : fileBName}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="arquivoA"
                stroke="#334155"
                strokeWidth={3}
                dot={{ fill: '#334155', r: 4 }}
                name="arquivoA"
              />
              <Line
                type="monotone"
                dataKey="arquivoB"
                stroke="#0284c7"
                strokeWidth={3}
                dot={{ fill: '#0284c7', r: 4 }}
                name="arquivoB"
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
