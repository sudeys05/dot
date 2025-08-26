import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [step, setStep] = useState('forgot'); // 'forgot' or 'reset'
  const [formData, setFormData] = useState({
    username: '',
    token: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const { forgotPassword, resetPassword } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccess('');
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const result = await forgotPassword(formData.username);

    if (result.success) {
      if (result.emailSent) {
        setSuccess('Password reset instructions have been sent to your email address. Please check your email for the reset token.');
        setStep('reset');
      } else if (result.token) {
        setResetToken(result.token);
        setFormData({ ...formData, token: result.token });
        setStep('reset');
        setSuccess('Reset token generated! (Email delivery failed - token shown above)');
      } else {
        setSuccess(result.message);
        setStep('reset');
      }
    } else {
      setError(result.message);
    }

    setIsLoading(false);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await resetPassword(formData.token, formData.password, formData.confirmPassword);

    if (result.success) {
      setSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        onClose();
        onSwitchToLogin();
        setStep('forgot');
        setFormData({
          username: '',
          token: '',
          password: '',
          confirmPassword: ''
        });
        setResetToken('');
        setSuccess('');
        setError('');
      }, 2000);
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
          <h2>{step === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        {step === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Sending Email...' : 'Send Reset Email'}
            </button>

            <div className="auth-info">
              <p>Enter your username or badge number. A password reset token will be sent to your registered email address.</p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {resetToken && (
              <div className="token-display">
                <label>Reset Token (Auto-filled)</label>
                <div className="token-value">{resetToken}</div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="token">Reset Token</label>
              <input
                type="text"
                id="token"
                name="token"
                value={formData.token}
                onChange={handleChange}
                required
                placeholder="Enter reset token"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter new password"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm new password"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>

            <div className="auth-links">
              <button 
                type="button" 
                className="link-button"
                onClick={() => setStep('forgot')}
              >
                ← Back to Generate Token
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <button 
              type="button" 
              className="link-button"
              onClick={onSwitchToLogin}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;