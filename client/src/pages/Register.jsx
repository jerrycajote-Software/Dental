import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    
    try {
      const data = await register(formData);
      setSuccess(data.message || 'Registration successful! Please check your email to verify your account.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a237e] to-[#42a5f5] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in duration-700 flex justify-center">
        <StyledWrapper>
          <div className="container">
            <div className="heading">Sign Up</div>
            
            {error && (
              <div style={{ color: '#e53e3e', textAlign: 'center', margin: '10px 0', fontSize: '14px', fontWeight: 'bold', background: '#fed7d7', padding: '10px 15px', borderRadius: '12px' }}>
                {error}
              </div>
            )}

            {success ? (
              <div className="success-container">
                <div className="success-icon">✉️</div>
                <h3 style={{ color: '#1a237e', fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>Check Your Email</h3>
                <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {success}
                </p>
                <Link to="/login" className="back-to-login">
                  Go to Sign In
                </Link>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="form">
                  <input 
                    required 
                    className="input" 
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <input 
                    required 
                    className="input" 
                    type="email" 
                    name="email" 
                    placeholder="E-mail" 
                    value={formData.email}
                    onChange={handleChange}
                  />
                  <div className="password-container">
                    <input 
                      required 
                      className="input" 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      placeholder="Password (min 8 characters)" 
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button 
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  
                  <div className="terms-container">
                    <div className="checkbox-wrapper-12">
                      <div className="cbx">
                        <input id="cbx-12" type="checkbox" required />
                        <label htmlFor="cbx-12" />
                        <svg width={15} height={14} viewBox="0 0 15 14" fill="none">
                          <path d="M2 8.36364L6.23077 12L13 2" />
                        </svg>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ position: 'absolute', width: 0, height: 0 }}>
                        <defs>
                          <filter id="goo-12">
                            <feGaussianBlur in="SourceGraphic" stdDeviation={4} result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -7" result="goo-12" />
                            <feBlend in="SourceGraphic" in2="goo-12" />
                          </filter>
                        </defs>
                      </svg>
                    </div>
                    <label htmlFor="cbx-12" className="terms-label">
                      I agree to the <span>Terms of Service</span> and <span>Privacy Policy</span>
                    </label>
                  </div>

                  <input 
                    className="login-button" 
                    type="submit" 
                    value={isSubmitting ? "Creating Account..." : "Sign Up"} 
                    disabled={isSubmitting}
                  />
                </form>
                
                <div className="agreement-container">
                  <span className="agreement">
                    <span style={{ color: '#aaa', fontSize: '12px', marginRight: '4px' }}>Already have an account?</span> 
                    <Link to="/login">Sign In</Link>
                  </span>
                </div>
              </>
            )}
            
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

  .success-container {
    text-align: center;
    padding: 20px 0;
  }

  .success-icon {
    font-size: 48px;
    margin-bottom: 15px;
  }

  .back-to-login {
    display: inline-block;
    background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    color: white;
    padding: 12px 30px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: bold;
    font-size: 14px;
    transition: all 0.2s ease-in-out;
  }

  .back-to-login:hover {
    transform: scale(1.03);
  }

  .terms-container {
    display: flex;
    align-items: center;
    margin-top: 25px;
    padding: 0 5px;
    gap: 15px;
  }

  .terms-label {
    font-size: 11px;
    color: #888;
    line-height: 1.4;
    cursor: pointer;
    font-weight: 500;
  }

  .terms-label span {
    color: rgb(16, 137, 211);
    font-weight: bold;
    text-decoration: none;
  }

  .form .login-button {
    display: block;
    width: 100%;
    font-weight: bold;
    background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    color: white;
    padding-block: 15px;
    margin: 30px auto 20px;
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

  .form .login-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .agreement-container {
    margin-top: 20px;
    text-align: center;
  }

  .agreement a {
    text-decoration: none;
    color: #0099ff;
    font-size: 12px;
    font-weight: bold;
  }

  /* Checkbox Animation Styles */
  .checkbox-wrapper-12 {
    position: relative;
    display: inline-block;
  }

  .checkbox-wrapper-12 > svg {
    position: absolute;
    top: -130%;
    left: -170%;
    width: 110px;
    pointer-events: none;
  }

  .checkbox-wrapper-12 * {
    box-sizing: border-box;
  }

  .checkbox-wrapper-12 input[type="checkbox"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    cursor: pointer;
    margin: 0;
  }

  .checkbox-wrapper-12 input[type="checkbox"]:focus {
    outline: 0;
  }

  .checkbox-wrapper-12 .cbx {
    width: 24px;
    height: 24px;
    position: relative;
  }

  .checkbox-wrapper-12 .cbx input {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px;
    height: 24px;
    border: 2px solid #bfbfc0;
    border-radius: 50%;
  }

  .checkbox-wrapper-12 .cbx label {
    width: 24px;
    height: 24px;
    background: none;
    border-radius: 50%;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate3d(0, 0, 0);
    pointer-events: none;
  }

  .checkbox-wrapper-12 .cbx svg {
    position: absolute;
    top: 5px;
    left: 4px;
    z-index: 1;
    pointer-events: none;
  }

  .checkbox-wrapper-12 .cbx svg path {
    stroke: #fff;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 19;
    stroke-dashoffset: 19;
    transition: stroke-dashoffset 0.3s ease;
    transition-delay: 0.2s;
  }

  .checkbox-wrapper-12 .cbx input:checked + label {
    animation: splash-12 0.6s ease forwards;
  }

  .checkbox-wrapper-12 .cbx input:checked + label + svg path {
    stroke-dashoffset: 0;
  }

  @-moz-keyframes splash-12 {
    40% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -18px 0 -8px rgb(16, 137, 211), 16px -8px 0 -8px rgb(16, 137, 211), 16px 8px 0 -8px rgb(16, 137, 211),
        0 18px 0 -8px rgb(16, 137, 211), -16px 8px 0 -8px rgb(16, 137, 211), -16px -8px 0 -8px rgb(16, 137, 211);
    }
    100% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent,
        32px 16px 0 -10px transparent, 0 36px 0 -10px transparent,
        -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent;
    }
  }

  @-webkit-keyframes splash-12 {
    40% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -18px 0 -8px rgb(16, 137, 211), 16px -8px 0 -8px rgb(16, 137, 211), 16px 8px 0 -8px rgb(16, 137, 211),
        0 18px 0 -8px rgb(16, 137, 211), -16px 8px 0 -8px rgb(16, 137, 211), -16px -8px 0 -8px rgb(16, 137, 211);
    }
    100% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent,
        32px 16px 0 -10px transparent, 0 36px 0 -10px transparent,
        -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent;
    }
  }

  @-o-keyframes splash-12 {
    40% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -18px 0 -8px rgb(16, 137, 211), 16px -8px 0 -8px rgb(16, 137, 211), 16px 8px 0 -8px rgb(16, 137, 211),
        0 18px 0 -8px rgb(16, 137, 211), -16px 8px 0 -8px rgb(16, 137, 211), -16px -8px 0 -8px rgb(16, 137, 211);
    }
    100% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent,
        32px 16px 0 -10px transparent, 0 36px 0 -10px transparent,
        -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent;
    }
  }

  @keyframes splash-12 {
    40% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -18px 0 -8px rgb(16, 137, 211), 16px -8px 0 -8px rgb(16, 137, 211), 16px 8px 0 -8px rgb(16, 137, 211),
        0 18px 0 -8px rgb(16, 137, 211), -16px 8px 0 -8px rgb(16, 137, 211), -16px -8px 0 -8px rgb(16, 137, 211);
    }
    100% {
      background: rgb(16, 137, 211);
      box-shadow: 0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent,
        32px 16px 0 -10px transparent, 0 36px 0 -10px transparent,
        -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent;
    }
  }
`;

export default Register;