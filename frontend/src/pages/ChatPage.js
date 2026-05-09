import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, ShoppingBag, Sparkles, RotateCcw, Bot, User,
  Loader, ChevronRight, Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiChat } from '../utils/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './ChatPage.css';

const SUGGESTED_PROMPTS = [
  "Show me all products",
  "I need a gift under ₹500",
  "What's your best product?",
  "Show me something for home",
  "Help me find something for the gym",
  "Show me premium products",
];

const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-indicator__avatar"><Bot size={14} /></div>
    <div className="typing-indicator__dots">
      <span /><span /><span />
    </div>
  </div>
);

const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`message message--${isUser ? 'user' : 'ai'}`}>
      <div className="message__avatar">
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className="message__bubble">
        {isUser
          ? <p>{msg.content}</p>
          : <ReactMarkdown>{msg.content}</ReactMarkdown>
        }
        {msg.products?.length > 0 && (
          <div className="message__products">
            {msg.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact={msg.products.length > 2}
              />
            ))}
          </div>
        )}
        <span className="message__time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const [messages, setMessages] = useState([{
    id: 1,
    role: 'assistant',
    content: "👋 Hi! I'm your AI shopping assistant\nI understand what you need and find the best matches from our store. Try asking me:\n- **\"Show me bags under ₹500\"**\n- **\"I need a gift for my mom\"**\n- **\"Best products for the gym\"**\n\nWhat are you looking for today?",
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (messageText) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const result  = await apiChat(history, text);

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.message,
        products: result.referencedProducts || [],
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Let's start fresh! What are you looking for today?",
      timestamp: new Date().toISOString(),
    }]);
    setError(null);
    setInput('');
  };

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__brand">
          <div className="chat-header__logo"><Sparkles size={18} /></div>
          <div>
            <h1 className="chat-header__title">AI Shopping Agent</h1>
            <span className="chat-header__subtitle">Smart search · No API key needed</span>
          </div>
        </div>

        <div className="chat-header__actions">
          <button className="header-btn" onClick={handleReset} title="Reset conversation">
            <RotateCcw size={16} />
          </button>
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="cart-btn__badge">{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="chat-messages">
        <div className="chat-messages__inner">
          {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
          {isLoading && <TypingIndicator />}
          {error && (
            <div className="chat-error">
              <Zap size={14} />{error}
            </div>
          )}

          {messages.length <= 1 && !isLoading && (
            <div className="suggestions">
              <p className="suggestions__label">Try asking:</p>
              <div className="suggestions__grid">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    className="suggestion-chip"
                    onClick={() => handleSend(prompt)}
                  >
                    <ChevronRight size={12} />{prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask me anything about our products..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={`chat-send-btn ${input.trim() && !isLoading ? 'active' : ''}`}
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader size={18} className="spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="chat-input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};

export default ChatPage;
