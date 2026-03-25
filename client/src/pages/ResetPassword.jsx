import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a237e] to-[#42a5f5] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in duration-700 flex justify-center">
        <StyledWrapper>
          <div className="container">
            <div className="heading">New Password</div>
            <p className="subheading">Set your new secure password below.</p>
            
            {message && (
              <div className="alert success">
                {message}
                <div className="redirect-text">Redirecting to login...</div>
              </div>
            )}
            
            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            {!message && (
              <form onSubmit={handleSubmit} className="form">
                <input 
                  required 
                  className="input" 
                  type="password" 
                  name="password" 
                  placeholder="New Password (min 8 chars)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <input 
                  required 
                  className="input" 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm New Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <input 
                  className="login-button" 
                  type="submit" 
                  value={isLoading ? "Resetting..." : "Reset Password"} 
                  disabled={isLoading}
                />
              </form>
            )}
            
            <div className="footer">
              <Link to="/login">Back to Sign In</Link>
            </div>
          </div>
        </StyledWrapper>
      </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  .container {
    max-width: 350px;
    background: #F8F9FD;
    background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
    border-radius: 40px;
    padding: 30px 35px;
    border: 5px solid rgb(255, 255, 255);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
    margin: 20px;
  }

  .heading {
    text-align: center;
    font-weight: 900;
    font-size: 24px;
    color: rgb(16, 137, 211);
    margin-bottom: 10px;
  }

  .subheading {
    text-align: center;
    font-size: 13px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .alert {
    padding: 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20px;
  }

  .alert.success {
    background: #f0fff4;
    color: #38a169;
    border: 1px solid #c6f6d5;
  }

  .alert.error {
    background: #fff5f5;
    color: #e53e3e;
    border: 1px solid #fed7d7;
  }

  .redirect-text {
    font-size: 11px;
    margin-top: 5px;
    font-weight: normal;
  }

  .form .input {
    width: 100%;
    background: white;
    border: none;
    padding: 15px 20px;
    border-radius: 20px;
    margin-top: 10px;
    box-shadow: #cff0ff 0px 10px 10px -5px;
    border-inline: 2px solid transparent;
  }

  .form .input:focus {
    outline: none;
    border-inline: 2px solid #12B1D1;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    color: white;
    padding-block: 15px;
    margin: 25px auto 10px;
    border-radius: 20px;
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
    border: none;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .form .login-button:hover:not(:disabled) {
    transform: scale(1.03);
  }

  .form .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .footer {
    text-align: center;
    margin-top: 20px;
  }

  .footer a {
    text-decoration: none;
    color: #0099ff;
    font-size: 13px;
    font-weight: bold;
  }
`;

export default ResetPassword;
