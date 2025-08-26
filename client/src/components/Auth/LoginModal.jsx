import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);

    if (result.success) {
      onClose();
      setFormData({ username: '', password: '' });
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content auth-modal">
        <div className="modal-header">
          <h2>Login to Police System</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Username / Badge Number</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-links">
          <button 
            type="button" 
            className="link-button"
            onClick={onSwitchToForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        <div className="auth-footer">
          <p>Contact your system administrator for account creation</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;