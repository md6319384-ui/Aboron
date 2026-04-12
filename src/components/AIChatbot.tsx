import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hello! I am your ShopEase assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a helpful customer support assistant for ShopEase, a dropshipping store specializing in gadgets and home decor. 
        Answer the customer's question based on these facts:
        - Shipping time: 7-15 business days.
        - Refund policy: 30-day returns for unused items.
        - Categories: Gadgets, Home Decor, Tech Accessories.
        - Support email: support@shopease.com.
        - Payment methods: bKash, Nagad, Credit Cards.
        
        Customer question: ${userMessage}`
      });

      const text = response.text || "I'm sorry, I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error('Gemini Error:', error);
      setMessages(prev => [...prev, { role: 'bot', text: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-bold">ShopEase AI</h4>
                  <p className="text-[10px] text-blue-100">Always online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-100" 
                      : "bg-white text-gray-700 border border-gray-100 rounded-tl-none shadow-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} className="group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
}

// Helper function locally if not imported
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
