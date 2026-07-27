import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import type { ChartDataPoint } from '../context/AppContext';
import { Send, Bot, X, Trash2, ArrowUpRight, Sparkles, User } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export const AiAssistant: React.FC = () => {
  const { chatMessages, sendChatMessage, clearChat } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Por que o lucro caiu este mês?",
    "Qual cultura foi mais rentável?",
    "Quanto economizaria reduzindo 5% do custo operacional?",
    "Verificar itens críticos de estoque"
  ];

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    sendChatMessage(input);
    setInput('');
  };

  const handleQuickQuestion = (q: string) => {
    sendChatMessage(q);
  };

  return (
    <>
      {/* Botão Flutuante da IA */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white flex items-center justify-center shadow-xl shadow-brand-600/30 z-30 transition-transform duration-200 hover:scale-105 active:scale-95"
        title="Assistente de IA Gea"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} className="animate-pulse" />}
      </button>

      {/* Painel Lateral da IA */}
      <div
        className={`fixed top-0 right-0 h-screen w-96 bg-white dark:bg-dark-card border-l border-slate-200 dark:border-dark-border shadow-2xl flex flex-col z-30 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-200 dark:border-dark-border/50 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Copilot Gea</h3>
              <p className="text-3xs text-slate-400 dark:text-slate-500">Inteligência Estratégica do Agro</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="Limpar Conversa"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Corpo da conversa */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40 dark:bg-dark-bg/20">
          {chatMessages.map((msg) => {
            const isAI = msg.sender === 'assistant';
            return (
              <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm ${
                  isAI 
                    ? 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-dark-border/40' 
                    : 'bg-brand-600 text-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1 text-3xs font-semibold uppercase tracking-wider opacity-60">
                    {isAI ? <Bot size={10} /> : <User size={10} />}
                    {isAI ? 'Inteligência Gea' : 'Você'}
                  </div>
                  <div className="whitespace-pre-line leading-relaxed font-sans">
                    {msg.content}
                  </div>

                  {/* Renderização de gráfico se disponível */}
                  {isAI && msg.charts && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 w-full h-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={msg.charts} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ 
                              background: '#0f172a', 
                              border: 'none', 
                              borderRadius: '4px',
                              fontSize: '9px',
                              color: '#fff'
                            }} 
                          />
                          <Bar dataKey={msg.charts[0].lucro !== undefined ? "lucro" : "custo"} fill="#10b981" radius={[2, 2, 0, 0]}>
                            {msg.charts.map((entry: ChartDataPoint, index: number) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.lucro !== undefined ? '#10b981' : '#f43f5e'} 
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                      <p className="text-3xs text-center text-slate-400 dark:text-slate-500 mt-1">Comparativo de Valores Operacionais (R$)</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Perguntas sugeridas rápidas */}
        {chatMessages.length <= 2 && (
          <div className="p-3 border-t border-slate-200 dark:border-dark-border/40 bg-white dark:bg-dark-card space-y-1.5">
            <span className="text-3xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Sugestões de consulta:</span>
            <div className="flex flex-col gap-1">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-brand-50 dark:bg-slate-900/60 dark:hover:bg-brand-950/20 text-3xs text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate">{q}</span>
                  <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input de Envio */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-dark-border/50 bg-white dark:bg-dark-card flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre rentabilidade, DRE..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-colors"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </>
  );
};
