import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ReportData {
  fileA: { name: string; type?: string };
  fileB: { name: string; type?: string };
  executiveSummary: string;
  fileASummary?: string;
  fileBSummary?: string;
  consolidatedMetrics: Array<{
    metric: string;
    valA: string;
    valB: string;
    variance: string;
    trend?: 'up' | 'down' | 'neutral' | string;
    status?: 'normal' | 'warning' | 'alert' | string;
  }>;
  discrepancies: Array<{
    item: string;
    fileADetail: string;
    fileBDetail: string;
    riskLevel: string;
    recommendation: string;
  }>;
  chartData?: Array<{
    category: string;
    arquivoA: number;
    arquivoB: number;
    variacaoPct?: number;
  }>;
  consolidatedRows?: Array<{
    id: string;
    item: string;
    valorA: string;
    valorB: string;
    diferenca: string;
    statusMatch: string;
  }>;
  keyInsights: string[];
  recommendations: string[];
}

export function exportConsolidatedPDF(data: ReportData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Colors
  const primaryColor: [number, number, number] = [15, 23, 42]; // Slate 900
  const accentColor: [number, number, number] = [79, 70, 229]; // Indigo 600
  const lightBg: [number, number, number] = [248, 250, 252]; // Slate 50
  const textColor: [number, number, number] = [51, 65, 85]; // Slate 700

  // Top Banner Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('RELATÓRIO CONSOLIDADO - ANÁLISE DUAL', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, 18);
  doc.text(`Arquivos: ${data.fileA.name}  vs  ${data.fileB.name}`, margin, 23);

  let currentY = 36;

  // Executive Summary Box
  doc.setFillColor(...lightBg);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...accentColor);
  doc.text('RESUMO EXECUTIVO CONSOLIDADO', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  
  const summaryLines = doc.splitTextToSize(
    data.executiveSummary || 'Nenhum resumo executivo disponível.',
    pageWidth - margin * 2 - 8
  );
  doc.text(summaryLines, margin + 4, currentY + 12);

  currentY += 34;

  // Section 1: Indicadores e Métricas Comparativas
  if (data.consolidatedMetrics && data.consolidatedMetrics.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('1. Indicadores Chave & Métricas Comparativas', margin, currentY);
    currentY += 4;

    const metricRows = data.consolidatedMetrics.map((m) => [
      m.metric,
      m.valA || '-',
      m.valB || '-',
      m.variance || '-',
      m.status === 'alert' ? 'CRÍTICO' : m.status === 'warning' ? 'ATENÇÃO' : 'OK',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Métrica / Indicador', data.fileA.name, data.fileB.name, 'Variação', 'Status']],
      body: metricRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249],
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 32, fontStyle: 'bold' },
        4: { cellWidth: 25, halign: 'center' },
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Section 2: Matriz de Discrepâncias
  if (data.discrepancies && data.discrepancies.length > 0) {
    if (currentY + 40 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('2. Matriz de Discrepâncias & Riscos Detectados', margin, currentY);
    currentY += 4;

    const discrepancyRows = data.discrepancies.map((d) => [
      d.item,
      d.fileADetail || '-',
      d.fileBDetail || '-',
      d.riskLevel || 'Baixa',
      d.recommendation || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Item / Registro', 'Valor/Detalhe (Arq A)', 'Valor/Detalhe (Arq B)', 'Risco', 'Recomendação']],
      body: discrepancyRows,
      theme: 'grid',
      headStyles: {
        fillColor: [185, 28, 28],
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [254, 242, 242],
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 'auto' },
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Section 3: Tabela de Dados Reconciliados
  if (data.consolidatedRows && data.consolidatedRows.length > 0) {
    if (currentY + 40 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('3. Tabela Consolidada Reconciliada', margin, currentY);
    currentY += 4;

    const rowData = data.consolidatedRows.map((r) => [
      r.item,
      r.valorA || '-',
      r.valorB || '-',
      r.diferenca || '-',
      r.statusMatch || 'OK',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['Item / Descrição', 'Valor (Arq A)', 'Valor (Arq B)', 'Diferença', 'Status de Correspondência']],
      body: rowData,
      theme: 'striped',
      headStyles: {
        fillColor: accentColor,
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: textColor,
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 32 },
        2: { cellWidth: 32 },
        3: { cellWidth: 28 },
        4: { cellWidth: 'auto', halign: 'center' },
      },
    });

    // @ts-ignore
    currentY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Section 4: Key Insights & Recommendations
  if ((data.keyInsights && data.keyInsights.length > 0) || (data.recommendations && data.recommendations.length > 0)) {
    if (currentY + 40 > pageHeight) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('4. Conclusões, Insights e Recomendações', margin, currentY);
    currentY += 6;

    if (data.keyInsights && data.keyInsights.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...accentColor);
      doc.text('Principais Insights:', margin, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);

      data.keyInsights.forEach((insight) => {
        const bulletLines = doc.splitTextToSize(`• ${insight}`, pageWidth - margin * 2 - 4);
        if (currentY + bulletLines.length * 4 > pageHeight - 15) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(bulletLines, margin + 2, currentY);
        currentY += bulletLines.length * 4 + 1;
      });
      currentY += 3;
    }

    if (data.recommendations && data.recommendations.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...accentColor);
      doc.text('Recomendações Práticas:', margin, currentY);
      currentY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...textColor);

      data.recommendations.forEach((rec) => {
        const bulletLines = doc.splitTextToSize(`→ ${rec}`, pageWidth - margin * 2 - 4);
        if (currentY + bulletLines.length * 4 > pageHeight - 15) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(bulletLines, margin + 2, currentY);
        currentY += bulletLines.length * 4 + 1;
      });
    }
  }

  // Footer on all pages
  // @ts-ignore
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text('Dual Document & Data Analyzer — Relatório Consolidado Exportável', margin, pageHeight - 5);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 5);
  }

  const safeNameA = data.fileA.name.replace(/[^a-zA-Z0-9]/g, '_');
  const safeNameB = data.fileB.name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Relatorio_Consolidado_${safeNameA}_vs_${safeNameB}.pdf`);
}
