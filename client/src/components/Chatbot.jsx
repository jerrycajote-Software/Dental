import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../services/api';
import { Send, X } from 'lucide-react';
import chatbotIcon from '../assets/ai.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! I am your Dental Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatbotRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: input });
      setMessages(prev => [...prev, { role: 'bot', text: response.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const MarkdownRenderer = ({ content }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mb-2 mt-3 first:mt-0" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-md font-bold text-white mb-2 mt-3 first:mt-0" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-white mb-1 mt-2 first:mt-0" {...props} />,
        p: ({ node, ...props }) => <p className="mb-2 last:mb-0 text-white leading-relaxed" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
        li: ({ node, ...props }) => <li className="text-white leading-relaxed" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
        em: ({ node, ...props }) => <em className="italic text-white" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary-action pl-3 italic text-slate-300 my-2" {...props} />,
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return inline ? (
            <code className="bg-slate-900 text-primary-action px-1 py-0.5 rounded text-xs font-mono" {...props}>{children}</code>
          ) : (
            <pre className="bg-slate-900 p-3 rounded-lg my-2 overflow-x-auto"><code className={className} {...props}>{children}</code></pre>
          );
        },
        a: ({ node, ...props }) => <a className="text-primary-action underline hover:text-primary-action/80" target="_blank" rel="noopener noreferrer" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={chatbotRef}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-white p-0 rounded-full shadow-2xl hover:scale-110 transition transform border-2 border-primary-action overflow-hidden w-16 h-16 flex items-center justify-center"
        >
          <img src={chatbotIcon} alt="Chatbot" className="w-full h-full object-cover" />
        </button>
      ) : (
        <div className="bg-slate-800 rounded-2xl shadow-2xl w-80 md:w-96 overflow-hidden flex flex-col border border-slate-700 h-[550px]">
          <div className="bg-primary-action p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={chatbotIcon} alt="AI" className="w-8 h-8 rounded-full bg-white object-cover" />
              <span className="font-bold">Dental Assistant AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-action/80 p-1 rounded transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary-action text-white rounded-tr-none' 
                    : 'bg-slate-700 text-white rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  ) : (
                    <div className="text-sm">
                      <MarkdownRenderer content={msg.text} />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 p-4 rounded-2xl rounded-tl-none text-slate-400 text-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-4 border-t border-slate-700 flex gap-2">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dental health..."
              className="flex-grow border border-slate-700 bg-slate-900 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-action/20"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-primary-action text-white p-2 rounded-full hover:bg-primary-action/90 transition disabled:bg-slate-600"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );

};

export default Chatbot;
