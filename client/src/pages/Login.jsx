import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendMessage('');
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.needsVerification) {
        setNeedsVerification(true);
        setError(responseData.message);
      } else {
        setError(responseData?.message || 'Login failed');
      }
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendMessage('');
    try {
      const data = await authService.resendVerification(email);
      setResendMessage(data.message || 'Verification email sent!');
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a237e] to-[#42a5f5] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in duration-700 flex justify-center">
        <StyledWrapper>
          <div className="container">
            <div className="heading">Sign In</div>
            
            {error && (
              <div style={{ 
                color: needsVerification ? '#c05621' : '#e53e3e', 
                textAlign: 'center', 
                margin: '10px 0', 
                fontSize: '13px', 
                fontWeight: 'bold', 
                background: needsVerification ? '#fefcbf' : '#fed7d7', 
                padding: '10px 15px', 
                borderRadius: '12px',
                lineHeight: '1.5'
              }}>
                {error}
              </div>
            )}

            {needsVerification && (
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0099ff',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: isResending ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    opacity: isResending ? 0.6 : 1,
                  }}
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {resendMessage && (
                  <p style={{ color: '#38a169', fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>
                    {resendMessage}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form">
              <input 
                required 
                className="input" 
                type="email" 
                name="email" 
                id="email" 
                placeholder="E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="password-container">
                <input 
                  required 
                  className="input" 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  id="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              <span className="forgot-password">
                <Link to="/forgot-password">Forgot Password ?</Link>
              </span>
              <input className="login-button" type="submit" value="Sign In" />
            </form>
            
            <span className="agreement" style={{ marginTop: '20px' }}>
              <Link to="/register">Don't have an account? Sign Up</Link>
            </span>
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
    padding: 25px 35px;
    border: 5px solid rgb(255, 255, 255);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
    margin: 20px;
  }

  .heading {
    text-align: center;
    font-weight: 900;
    font-size: 30px;
    color: rgb(16, 137, 211);
  }

  .form {
    margin-top: 20px;
  }

  .form .input {
    width: 100%;
    background: white;
    border: none;
    padding: 15px 20px;
    border-radius: 20px;
    margin-top: 15px;
    box-shadow: #cff0ff 0px 10px 10px -5px;
    border-inline: 2px solid transparent;
  }

  .form .input::-moz-placeholder {
    color: rgb(170, 170, 170);
  }

  .form .input::placeholder {
    color: rgb(170, 170, 170);
  }

  .form .input:focus {
    outline: none;
    border-inline: 2px solid #12B1D1;
  }

  .password-container {
    position: relative;
    width: 100%;
  }

  .toggle-password {
    position: absolute;
    right: 15px;
    top: 58%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #aaa;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    transition: color 0.2s;
  }

  .toggle-password:hover {
    color: #12B1D1;
  }

  .form .forgot-password {
    display: block;
    margin-top: 10px;
    margin-left: 10px;
  }

  .form .forgot-password a {
    font-size: 11px;
    color: #0099ff;
    text-decoration: none;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    color: white;
    padding-block: 15px;
    margin: 20px auto;
    border-radius: 20px;
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
    border: none;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
  }

  .form .login-button:hover {
    transform: scale(1.03);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
  }

  .form .login-button:active {
    transform: scale(0.95);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 15px 10px -10px;
  }

  .agreement {
    display: block;
    text-align: center;
    margin-top: 15px;
  }

  .agreement a {
    text-decoration: none;
    color: #0099ff;
    font-size: 11px;
  }
`;

export default Login;