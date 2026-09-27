import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint for analyzing two files and producing a structured consolidation report
app.post('/api/analyze-files', async (req, res) => {
  try {
    const { fileA, fileB, customInstructions } = req.body;

    if (!fileA || !fileB) {
      return res.status(400).json({ error: 'É necessário fornecer o Arquivo A e o Arquivo B.' });
    }

    const systemInstruction = `Você é um analista especialista de dados e auditor sênior em consolidação de documentos. 
Sua tarefa é analisar rigorosamente DOIS arquivos fornecidos (Arquivo A e Arquivo B), identificar padrões, correspondências, discrepâncias, variações percentuais, reconciliar as informações e sintetizar um relatório executivo consolidado em Português (pt-BR).

Retorne EXATAMENTE uma resposta em formato JSON contendo a estrutura especificada.`;

    const prompt = `Analise detalhadamente os dois arquivos abaixo:

--- ARQUIVO A ---
Nome: ${fileA.name}
Tipo/Tamanho: ${fileA.type || 'N/A'}
Conteúdo/Resumo:
${typeof fileA.content === 'string' ? fileA.content.slice(0, 15000) : JSON.stringify(fileA.content).slice(0, 15000)}

--- ARQUIVO B ---
Nome: ${fileB.name}
Tipo/Tamanho: ${fileB.type || 'N/A'}
Conteúdo/Resumo:
${typeof fileB.content === 'string' ? fileB.content.slice(0, 15000) : JSON.stringify(fileB.content).slice(0, 15000)}

${customInstructions ? `Foco / Instruções Específicas do Usuário: ${customInstructions}` : ''}

Por favor, faça a consolidação e análise comparativa e responda em JSON com a seguinte estrutura:
{
  "executiveSummary": "Resumo executivo claro, conciso e profissional em Português destacando o objetivo da comparação e os principais achados.",
  "fileASummary": "Resumo dos aspectos principais do Arquivo A (total de registros, valores totais ou temas principais).",
  "fileBSummary": "Resumo dos aspectos principais do Arquivo B (total de registros, valores totais ou temas principais).",
  "consolidatedMetrics": [
    {
      "metric": "Nome do Indicador / Métrica (ex: Receita Total, Qtd Itens, Custo Médio)",
      "valA": "Valor no Arquivo A",
      "valB": "Valor no Arquivo B",
      "variance": "Variação Absoluta ou % (ex: +12.5%, -R$ 4.500)",
      "trend": "up" | "down" | "neutral",
      "status": "normal" | "warning" | "alert"
    }
  ],
  "discrepancies": [
    {
      "item": "Item/Chave identificadora (ex: Produto X, Pedido #1024, Categoria Y)",
      "fileADetail": "Detalhe/Valor no Arquivo A",
      "fileBDetail": "Detalhe/Valor no Arquivo B",
      "riskLevel": "Alta" | "Média" | "Baixa",
      "recommendation": "Ação recomendada para alinhar ou solucionar a discrepância"
    }
  ],
  "chartData": [
    {
      "category": "Nome da Categoria/Item",
      "arquivoA": 100,
      "arquivoB": 120,
      "variacaoPct": 20
    }
  ],
  "consolidatedRows": [
    {
      "id": "1",
      "item": "Descrição do Item",
      "valorA": "100",
      "valorB": "115",
      "diferenca": "+15",
      "statusMatch": "Correspondente" | "Divergente" | "Apenas no Arquivo A" | "Apenas no Arquivo B"
    }
  ],
  "keyInsights": [
    "Insight importante 1 sobre a relação entre os arquivos",
    "Insight importante 2 sobre potenciais economias, erros ou duplicidades",
    "Insight importante 3 sobre a evolução dos dados"
  ],
  "recommendations": [
    "Recomendação prática 1 para gestão ou decisão",
    "Recomendação prática 2 para reconciliação final"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch {
      // Fallback clean regex match if raw markdown fences exist
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedJson = JSON.parse(cleanText);
    }

    return res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error('Erro na análise de arquivos:', error);
    return res.status(500).json({
      error: 'Falha ao analisar os arquivos.',
      message: error.message || 'Ocorreu um erro ao processar com a IA.',
    });
  }
});

// Endpoint for interactive user queries about the 2 files
app.post('/api/query-files', async (req, res) => {
  try {
    const { fileA, fileB, question, history } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Pergunta não fornecida.' });
    }

    const systemInstruction = `Você é um assistente especialista em análise comparativa de dados. Responda à pergunta do usuário de forma direta, precisa e baseada estritamente nos dois arquivos fornecidos. Use linguagem clara em Português.`;

    const prompt = `--- ARQUIVO A: ${fileA?.name || 'Arquivo A'} ---
${typeof fileA?.content === 'string' ? fileA.content.slice(0, 10000) : JSON.stringify(fileA?.content || '').slice(0, 10000)}

--- ARQUIVO B: ${fileB?.name || 'Arquivo B'} ---
${typeof fileB?.content === 'string' ? fileB.content.slice(0, 10000) : JSON.stringify(fileB?.content || '').slice(0, 10000)}

Histórico da conversa:
${history ? JSON.stringify(history).slice(0, 2000) : 'Nenhum'}

Pergunta do Usuário: ${question}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Erro na consulta interativa:', error);
    return res.status(500).json({ error: 'Erro ao responder à pergunta.', message: error.message });
  }
});

// Vite middleware setup for dev mode
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
  });
  app.use(vite.middlewares);

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith('/api')) {
      return next();
    }
    try {
      const rawHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
      const template = await vite.transformIndexHtml(url, rawHtml);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
} else {
  // Static serve for production
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
