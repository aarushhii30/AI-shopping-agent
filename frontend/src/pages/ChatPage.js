import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, ShoppingBag, Sparkles, RotateCcw, Bot, User,
  Loader, ChevronRight, Zap, Mic, MicOff, LogOut
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { apiChat } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './ChatPage.css';
import { saveSearch, saveViewedProduct, getTopCategory, getSession, clearSession } from '../utils/userSession';

const SUGGESTED_PROMPTS = [
  "Show me all products",
  "I need a gift under ₹500",
  "What's your best product?",
  "Show me something for home",
  "Help me find something for the gym",
  "Show me premium products",
];

const getWelcomeMessage = () => {
  const topCategory = getTopCategory();
  if (topCategory) {
    return `👋 Welcome back! You seem to love **${topCategory}** products.\nWant me to show you the latest in that category, or are you looking for something else today?`;
  }
  return "👋 Hi! I'm your AI shopping assistant\nI understand what you need and find the best matches from our store. Try asking me:\n- **\"Show me bags under ₹500\"**\n- **\"I need a gift for my mom\"**\n- **\"Best products for the gym\"**\n\nWhat are you looking for today?";
};

const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-indicator__avatar"><Bot size={14} /></div>
    <div className="typing-indicator__dots">
      <span /><span /><span />
    </div>
  </div>
);

const Message = ({ msg, onProductClick }) => {
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
                onClick={() => onProductClick(product)}
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
  const { user, logout } = useAuth();

  // When Firebase signs out, user becomes null → redirect to /auth.
  // This is the correct pattern: let auth state drive navigation,
  // not a manual navigate() call right after logout().
  useEffect(() => {
    if (user === null) {
      navigate('/auth', { replace: true });
    }
  }, [user, navigate]);

  const [messages, setMessages] = useState([{
    id: 1,
    role: 'assistant',
    content: getWelcomeMessage(),
    timestamp: new Date().toISOString(),
  }]);

  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef              = useRef(null);

  const session = getSession();
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Logout: only call signOut + clearSession.
  // The useEffect above reacts to user → null and navigates.
  const handleLogout = useCallback(async () => {
    try {
      recognitionRef.current?.stop();
      clearSession();
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [logout]);

  const handleProductClick = useCallback((product) => {
    saveViewedProduct({
      id: product.id,
      title: product.title,
      category: product.productType || product.category || '',
      price: product.price,
      image: product.image,
    });
  }, []);

  const handleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input is not supported in this browser. Please use Chrome.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText('');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang            = 'en-IN';
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => { setIsListening(true); setInterimText(''); };

    recognition.onresult = (event) => {
      let finalText    = '';
      let interimChunk = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + ' ';
        else interimChunk += t;
      }
      if (finalText) setInput((prev) => (prev + finalText).trimStart());
      setInterimText(interimChunk);
    };

    recognition.onerror = (e) => {
      setIsListening(false);
      setInterimText('');
      if (e.error === 'not-allowed')
        alert('Microphone access denied. Please allow mic in browser settings.');
    };

    recognition.onend = () => { setIsListening(false); setInterimText(''); };
    recognition.start();
  }, [isListening]);

  const handleSend = useCallback(async (messageText) => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText('');
    }

    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    saveSearch(text);

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
  }, [input, isLoading, isListening, messages]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleReset = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Let's start fresh! What are you looking for today?",
      timestamp: new Date().toISOString(),
    }]);
    setError(null);
    setInput('');
  };

  const displayValue = isListening && interimText ? input + interimText : input;

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__brand">
          <div className="chat-header__logo"><Sparkles size={18} /></div>
          <div>
            <h1 className="chat-header__title">AI Shopping Agent</h1>
          </div>
        </div>
        <div className="chat-header__actions">
          <button className="header-btn" onClick={handleReset} title="Reset conversation">
            <RotateCcw size={16} />
          </button>
          <button className="cart-btn" onClick={() => navigate('/cart')}>
            <ShoppingBag size={18} />
            {totalItems > 0 && <span className="cart-btn__badge">{totalItems}</span>}
          </button>
          <button className="header-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="chat-messages">
        <div className="chat-messages__inner">
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} onProductClick={handleProductClick} />
          ))}
          {isLoading && <TypingIndicator />}
          {error && <div className="chat-error"><Zap size={14} />{error}</div>}

          {messages.length <= 1 && !isLoading && (
            <div className="suggestions">
              {session.searchHistory.length > 0 && (
                <div className="recent-searches">
                  <p className="suggestions__label">Recent:</p>
                  <div className="suggestions__grid">
                    {session.searchHistory.slice(0, 3).map((q, i) => (
                      <button
                        key={i}
                        className="suggestion-chip recent-chip"
                        onClick={() => handleSend(q)}
                      >
                        🕐 {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
        {isListening && (
          <div className="voice-listening-bar">
            <span className="voice-dot" />
            <span className="voice-listening-text">
              {interimText ? interimText : 'Listening… speak now'}
            </span>
          </div>
        )}

        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={isListening ? '🎤 Listening...' : 'Ask me anything about our products...'}
            value={displayValue}
            onChange={(e) => { if (!isListening) setInput(e.target.value); }}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />

          <button
            className={`chat-voice-btn ${isListening ? 'chat-voice-btn--listening' : ''}`}
            onClick={handleVoice}
            disabled={isLoading}
            title={isListening ? 'Stop listening' : 'Voice input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            className={`chat-send-btn ${(input.trim() || interimText) && !isLoading ? 'active' : ''}`}
            onClick={() => handleSend()}
            disabled={(!input.trim() && !interimText) || isLoading}
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