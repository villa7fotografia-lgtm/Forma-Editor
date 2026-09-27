import React, { useState } from 'react';
import { MessageSquare, Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { ParsedFileResult } from '../utils/fileParser';

interface AiChatDrawerProps {
  fileA: ParsedFileResult | null;
  fileB: ParsedFileResult | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ fileA, fileB }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou seu assistente de análise de fotografia e dados. Já analisei o Arquivo A e o Arquivo B. Como posso ajudar? (Ex: "Qual foto teve maior classificação?", "Qual o valor total orçado no Arquivo B?", "Quais divergências principais foram encontradas?")',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading || !fileA || !fileB) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/query-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileA: { name: fileA.name, content: fileA.rawContent },
          fileB: { name: fileB.name, content: fileB.rawContent },
          question: userMessage,
          history: messages.slice(-6),
        }),
      });

      const data = await response.json();

      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Desculpe, ocorreu um erro ao consultar os arquivos. Tente novamente.' },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erro de conexão com o servidor de IA.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-slate-300 shadow-md space-y-4 max-w-4xl mx-auto flex flex-col h-[600px] text-slate-800 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 font-display">Assistente IA de Fotografia e Dados</h3>
          <p className="text-xs text-slate-500">
            Perguntas em tempo real sobre os arquivos {fileA?.name} e {fileB?.name}
          </p>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-slate-100 border border-slate-300 text-slate-800'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none font-medium shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-800" />
            Analisando metadados e formulando resposta...
          </div>
        )}
      </div>

      {/* Quick Question Chips */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar text-[11px]">
        <button
          onClick={() => setInput('Quais os 3 principais pontos de divergência entre os arquivos?')}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shrink-0 transition-colors font-semibold"
        >
          💡 3 principais divergências
        </button>
        <button
          onClick={() => setInput('Resuma as solicitações de edição do cliente')}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shrink-0 transition-colors font-semibold"
        >
          📸 Solicitações de edição
        </button>
        <button
          onClick={() => setInput('Existe algum item no Arquivo A ausente no Arquivo B?')}
          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shrink-0 transition-colors font-semibold"
        >
          🔍 Itens ausentes
        </button>
      </div>

      {/* Input Box */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Faça qualquer pergunta sobre os dois arquivos..."
          className="flex-1 px-4 py-2.5 bg-slate-50 text-slate-900 rounded-lg border border-slate-300 focus:outline-none focus:border-slate-800 text-xs placeholder-slate-400"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Enviar
        </button>
      </div>
    </div>
  );
};
