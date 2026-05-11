// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Loader } from 'lucide-react';
import './AuthPage.css';


const AuthPage = () => {
  const navigate              = useNavigate();
  const { login, signup }     = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        console.log("BEFORE NAVIGATE");
        window.location.href = '/chat';
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        await signup(email, password, name);

      }window.location.href = '/chat';
      navigate('/');
    } catch (err) {
      const msg = {
        'auth/user-not-found'    : 'No account found with this email.',
        'auth/wrong-password'    : 'Incorrect password. Try again.',
        'auth/email-already-in-use': 'This email is already registered. Please log in.',
        'auth/invalid-email'     : 'Please enter a valid email address.',
        'auth/weak-password'     : 'Password should be at least 6 characters.',
        'auth/invalid-credential': 'Invalid email or password.',
      }[err.code] || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo__icon"><Sparkles size={22} /></div>
          <h1 className="auth-logo__title">AI Shopping Agent</h1>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
          type="button"
            className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-field">
              <User size={16} className="auth-field__icon" />
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="auth-input"
                required={!isLogin}
              />
            </div>
          )}

          <div className="auth-field">
            <Mail size={16} className="auth-field__icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>

          <div className="auth-field">
            <Lock size={16} className="auth-field__icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? <Loader size={18} className="spin" />
              : isLogin ? 'Login' : 'Create Account'
            }
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
          type="button"
            className="auth-switch__link"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthPage;
