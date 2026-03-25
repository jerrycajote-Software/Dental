import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import styled from 'styled-components';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    if (token) {
      verify();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a237e] to-[#42a5f5] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
      <div className="w-full max-w-[400px] relative z-10 animate-in fade-in duration-700 flex justify-center">
        <StyledWrapper>
          <div className="container">
            {status === 'verifying' && (
              <div className="status-container">
                <div className="status-icon spinning">⏳</div>
                <h2 className="status-title">Verifying Your Email...</h2>
                <p className="status-message">Please wait while we verify your email address.</p>
              </div>
            )}

            {status === 'success' && (
              <div className="status-container">
                <div className="status-icon">✅</div>
                <h2 className="status-title success">Email Verified!</h2>
                <p className="status-message">{message}</p>
                <Link to="/login" className="action-button">
                  Go to Sign In
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="status-container">
                <div className="status-icon">❌</div>
                <h2 className="status-title error">Verification Failed</h2>
                <p className="status-message">{message}</p>
                <Link to="/register" className="action-button secondary">
                  Register Again
                </Link>
                <Link to="/login" className="action-link">
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </StyledWrapper>
      </div>
    </div>
  );
};

const StyledWrapper = styled.div`
  .container {
    max-width: 380px;
    background: #F8F9FD;
    background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
    border-radius: 40px;
    padding: 40px 35px;
    border: 5px solid rgb(255, 255, 255);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
    margin: 20px;
  }

  .status-container {
    text-align: center;
  }

  .status-icon {
    font-size: 56px;
    margin-bottom: 20px;
  }

  .status-icon.spinning {
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .status-title {
    font-weight: 900;
    font-size: 24px;
    color: rgb(16, 137, 211);
    margin-bottom: 12px;
  }

  .status-title.success {
    color: #38a169;
  }

  .status-title.error {
    color: #e53e3e;
  }

  .status-message {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 25px;
  }

  .action-button {
    display: inline-block;
    background: linear-gradient(45deg, rgb(16, 137, 211) 0%, rgb(18, 177, 209) 100%);
    color: white;
    padding: 14px 40px;
    border-radius: 25px;
    text-decoration: none;
    font-weight: bold;
    font-size: 15px;
    transition: all 0.2s ease-in-out;
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 20px 10px -15px;
  }

  .action-button:hover {
    transform: scale(1.03);
    box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 23px 10px -20px;
  }

  .action-button.secondary {
    background: linear-gradient(45deg, #e53e3e, #fc8181);
    box-shadow: rgba(229, 62, 62, 0.4) 0px 20px 10px -15px;
  }

  .action-link {
    display: block;
    margin-top: 15px;
    color: #0099ff;
    font-size: 13px;
    text-decoration: none;
    font-weight: bold;
  }

  .action-link:hover {
    text-decoration: underline;
  }
`;

export default VerifyEmail;
