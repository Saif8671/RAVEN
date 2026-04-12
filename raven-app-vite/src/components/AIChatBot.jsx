import { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, X, Bot, Trash2, ShieldAlert } from 'lucide-react';
import { chatWithAI } from '../services/api';

export function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello. I am RAVEN AI, your Incident Response Assistant. How can I help you contain this threat?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const { reply } = await chatWithAI(userMessage, messages);
      setMessages([...newMessages, { role: 'ai', content: reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'ai', content: `Error: ${error.message || 'Connection failed.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'ai', content: 'Chat history cleared. How can I assist you further?' }
    ]);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <Motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="feat-chatbot-fab"
            onClick={() => setIsOpen(true)}
          >
            <ShieldAlert size={28} />
            <span className="feat-chatbot-fab-badge">AI</span>
          </Motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="feat-chatbot-window"
          >
            <div className="feat-chatbot-header">
              <div className="feat-chatbot-header-title">
                <Bot size={20} className="feat-chatbot-icon-ai" />
                <span>RAVEN AI Assistant</span>
              </div>
              <div className="feat-chatbot-header-actions">
                <button onClick={clearChat} title="Clear Chat" className="feat-chatbot-btn-clear">
                  <Trash2 size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} title="Close" className="feat-chatbot-btn-close">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="feat-chatbot-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`feat-chatbot-message-wrapper ${msg.role}`}>
                  <div className={`feat-chatbot-message ${msg.role}`}>
                    {msg.role === 'ai' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="feat-chatbot-message-wrapper ai">
                  <div className="feat-chatbot-message ai typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="feat-chatbot-input-area">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for tactical advice..."
                disabled={isLoading}
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="feat-chatbot-btn-send">
                <Send size={18} />
              </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
