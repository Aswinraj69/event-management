'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';

export default function AiAgentWidget({ brandColor = '#8b5cf6' }: { brandColor?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant. Ask me anything about your events or vendors.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('evento_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://event-management-production-b372.up.railway.app'}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I am not available right now.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error communicating with AI.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 text-white rounded-full shadow-2xl transition-transform hover:scale-110 z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
        style={{ backgroundColor: brandColor }}
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[#0f0f13] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in" style={{ height: '500px', maxHeight: '80vh' }}>
          {/* Header */}
          <div className="p-4 flex items-center justify-between text-white" style={{ backgroundColor: brandColor }}>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-bold text-sm tracking-wide">AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`px-4 py-2 text-xs leading-relaxed max-w-[85%] rounded-2xl ${
                    m.role === 'user' 
                      ? 'text-white' 
                      : 'bg-white/[0.05] border border-white/[0.05] text-gray-300'
                  }`}
                  style={m.role === 'user' ? { backgroundColor: brandColor, borderBottomRightRadius: '4px' } : { borderBottomLeftRadius: '4px' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-white/[0.05] border border-white/[0.05] text-gray-400 rounded-2xl rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/[0.05] bg-[#0f0f13]">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={loading}
                className="w-full bg-black/40 border border-white/[0.08] text-white text-xs rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button 
                type="submit" 
                disabled={loading || !input.trim()}
                className="absolute right-2 p-1.5 text-white/50 hover:text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
