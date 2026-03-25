import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1089d3] to-[#12b1d1] flex items-center justify-center text-white font-bold text-lg shadow-md">
              D
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Doctor <span className="text-[#0D9488]">Portal</span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">Dental CarePlus</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Welcome</p>
              <p className="text-sm font-black text-slate-900">Dr. {user?.name || 'Doctor'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-xl border-2 border-slate-900 bg-transparent px-5 py-2 text-xs font-black text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StyledWrapper>
          {/* Welcome Card */}
          <div className="welcome-card">
            <div className="welcome-icon">🩺</div>
            <h2 className="welcome-title">Welcome, Dr. {user?.name || 'Doctor'}!</h2>
            <p className="welcome-subtitle">
              Your doctor dashboard is being prepared. Check back soon for features like:
            </p>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">📅</span>
                <span className="feature-text">Appointment Management</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span className="feature-text">Patient Records</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Schedule Overview</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💬</span>
                <span className="feature-text">Patient Communication</span>
              </div>
            </div>
          </div>
        </StyledWrapper>
      </main>
    </div>
  );
};

const StyledWrapper = styled.div`
  .welcome-card {
    background: white;
    border-radius: 24px;
    padding: 50px 40px;
    text-align: center;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    max-width: 600px;
    margin: 0 auto;
  }

  .welcome-icon {
    font-size: 64px;
    margin-bottom: 20px;
  }

  .welcome-title {
    font-size: 28px;
    font-weight: 900;
    color: #1a237e;
    margin-bottom: 12px;
  }

  .welcome-subtitle {
    font-size: 15px;
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 30px;
  }

  .features-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    max-width: 400px;
    margin: 0 auto;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f8fafc;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
  }

  .feature-item:hover {
    border-color: #1089d3;
    background: #f0f9ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 137, 211, 0.1);
  }

  .feature-icon {
    font-size: 22px;
  }

  .feature-text {
    font-size: 13px;
    font-weight: 700;
    color: #334155;
  }

  @media (max-width: 480px) {
    .features-grid {
      grid-template-columns: 1fr;
    }
    .welcome-card {
      padding: 30px 20px;
    }
  }
`;

export default DoctorDashboard;
