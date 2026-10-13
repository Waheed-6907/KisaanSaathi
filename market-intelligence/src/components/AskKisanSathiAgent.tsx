'use client';

import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Terminal, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  toolExecutions?: Array<{ tool: string; args: any; result: any }>;
  provenance?: {
    isGrounded: boolean;
    sources: string[];
    caveat: string;
  };
  timestamp: string;
}

export const AskKisanSathiAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-001',
      sender: 'agent',
      text: "Namaste! I am the **Kisan Sathi Pricing Agent**.\n\nI answer your agricultural market pricing queries using **strictly verified government APMC records** from Agmarknet and the Directorate of Marketing & Inspection (Govt of India).\n\nAsk me about current mandi rates, inter-market price comparisons, or net realization calculations with transport deductions.",
      provenance: {
        isGrounded: true,
        sources: ['AGMARKNET', 'DATA_GOV_IN'],
        caveat: 'Zero-hallucination protocols active. All prices verified.'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const samplePrompts = [
    "What is current Telangana Sona paddy rate at Enumamula?",
    "I have 40 quintals of cotton, calculate my net return",
    "Compare turmeric prices across Telangana mandis",
    "Is chilli price trending up in Khammam?"
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      if (data.success) {
        const agentMsg: ChatMessage = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: data.reply,
          toolExecutions: data.toolExecutions,
          provenance: data.provenance,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, agentMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: `⚠️ **Operational Alert**: ${data.error || 'Failed to process market query'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: `⚠️ **Connection Error**: ${err.message}. Please check local connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const toggleTools = (id: string) => {
    setExpandedTools(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
          <Bot className="w-6 h-6 text-emerald-600" />
          <span>Ask Kisan Sathi AI &bull; Grounded Market Intelligence</span>
        </h2>
        <p className="text-xs text-slate-500">
          Strictly grounded tool-calling LLM. Prices and math are deterministically calculated in backend code.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-xs bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition shadow-sm"
          >
            &ldquo;{prompt}&rdquo;
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none shadow-sm'
              }`}>
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Tool Executions & Grounding Evidence Accordion */}
                {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80">
                    <button
                      onClick={() => toggleTools(msg.id)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Inspected Evidence & Tools ({msg.toolExecutions.length} executed)</span>
                      {expandedTools[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {expandedTools[msg.id] && (
                      <div className="mt-2 space-y-2 bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                        <div className="text-emerald-400 font-bold mb-1">
                          ✔ Verified Zero-Hallucination Tool Dispatch:
                        </div>
                        {msg.toolExecutions.map((t, idx) => (
                          <div key={idx} className="border-b border-slate-800 pb-2 last:border-none last:pb-0">
                            <span className="text-amber-400">Tool: {t.tool}</span>
                            <div className="text-slate-400 text-[11px] mt-0.5">
                              Args: {JSON.stringify(t.args)}
                            </div>
                            <div className="text-emerald-300 text-[11px] mt-0.5">
                              Result: {JSON.stringify(t.result).substring(0, 160)}...
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Provenance Badge */}
                {msg.provenance && (
                  <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sources: {msg.provenance.sources.join(', ') || 'Agmarknet APMC'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center space-x-2 shadow-sm">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Executing read-only tools and verifying official mandi observations...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask about paddy rate, cotton price in Warangal, net return calculation..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl transition flex items-center space-x-1.5 shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Agent</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
