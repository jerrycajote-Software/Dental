import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false, doctorOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" />;
  if (doctorOnly && user.role !== 'doctor') return <Navigate to="/dashboard" />;

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'doctor') return <Navigate to="/doctor" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isFullScreenPage = ['/login', '/admin', '/doctor', '/forgot-password'].includes(location.pathname) 
    || location.pathname.startsWith('/verify-email')
    || location.pathname.startsWith('/reset-password');

  return (
    <div className="min-h-screen flex flex-col">
      {!isFullScreenPage && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute doctorOnly><DoctorDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      {!isFullScreenPage && <Footer />}
      {!isFullScreenPage && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
