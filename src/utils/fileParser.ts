import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFileResult {
  name: string;
  size: number;
  type: string;
  rawContent: string;
  headers: string[];
  rows: any[];
  rowCount: number;
  format: 'csv' | 'excel' | 'json' | 'text';
}

export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const fileName = file.name;
  const fileType = file.type;
  const fileSize = file.size;

  const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileType.includes('spreadsheet') || fileType.includes('excel');
  const isJson = fileName.endsWith('.json') || fileType.includes('json');
  const isCsv = fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileType.includes('csv');

  if (isExcel) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

          if (!jsonData || jsonData.length === 0) {
            resolve({
              name: fileName,
              size: fileSize,
              type: fileType,
              rawContent: '',
              headers: [],
              rows: [],
              rowCount: 0,
              format: 'excel',
            });
            return;
          }

          const headers = (jsonData[0] || []).map((h) => String(h || ''));
          const dataRows = jsonData.slice(1).filter((r) => r.length > 0);

          const rowsAsObjects = dataRows.map((r) => {
            const obj: Record<string, any> = {};
            headers.forEach((h, idx) => {
              obj[h || `Coluna_${idx + 1}`] = r[idx] !== undefined ? r[idx] : '';
            });
            return obj;
          });

          const csvText = XLSX.utils.sheet_to_csv(worksheet);

          resolve({
            name: fileName,
            size: fileSize,
            type: fileType,
            rawContent: csvText,
            headers,
            rows: rowsAsObjects,
            rowCount: dataRows.length,
            format: 'excel',
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsBinaryString(file);
    });
  }

  if (isJson) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          let rows: any[] = [];
          let headers: string[] = [];

          if (Array.isArray(parsed)) {
            rows = parsed;
            if (rows.length > 0 && typeof rows[0] === 'object') {
              headers = Object.keys(rows[0]);
            }
          } else if (typeof parsed === 'object') {
            rows = [parsed];
            headers = Object.keys(parsed);
          }

          resolve({
            name: fileName,
            size: fileSize,
            type: fileType,
            rawContent: text,
            headers,
            rows,
            rowCount: rows.length,
            format: 'json',
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;

      if (isCsv) {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data as any[];
            const headers = results.meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);
            resolve({
              name: fileName,
              size: fileSize,
              type: fileType,
              rawContent: text,
              headers,
              rows,
              rowCount: rows.length,
              format: 'csv',
            });
          },
          error: (err: any) => reject(err),
        });
      } else {
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        resolve({
          name: fileName,
          size: fileSize,
          type: fileType,
          rawContent: text,
          headers: ['Linha / Conteúdo'],
          rows: lines.map((l, idx) => ({ Linha: idx + 1, Conteudo: l })),
          rowCount: lines.length,
          format: 'text',
        });
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

export function parseStringData(fileName: string, content: string, type: string): ParsedFileResult {
  if (content.includes(',') || content.includes(';') || fileName.endsWith('.csv')) {
    const result = Papa.parse(content, { header: true, skipEmptyLines: true });
    const rows = result.data as any[];
    const headers = result.meta.fields || (rows.length > 0 ? Object.keys(rows[0]) : []);
    return {
      name: fileName,
      size: content.length,
      type,
      rawContent: content,
      headers,
      rows,
      rowCount: rows.length,
      format: 'csv',
    };
  }

  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  return {
    name: fileName,
    size: content.length,
    type,
    rawContent: content,
    headers: ['Linha / Conteúdo'],
    rows: lines.map((l, idx) => ({ Linha: idx + 1, Conteudo: l })),
    rowCount: lines.length,
    format: 'text',
  };
}
