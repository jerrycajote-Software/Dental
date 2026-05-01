import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import api from '../services/api';
import WalkinAppointmentForm from '../components/WalkinAppointmentForm'; //
import WalkinRegisteredForm from '../components/WalkinRegisteredForm';
import styled from 'styled-components';
import {
  FiCalendar,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiLoader,
  FiActivity,
  FiToggleLeft,
  FiToggleRight,
  FiCalendar as FiCalIcon,
  FiTrash2,
  FiPlus,
  FiSettings,
  FiLock,
} from 'react-icons/fi';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    completed: 0
  });

  const [showForm, setShowForm] = useState(false); //
  const [showBookingChoice, setShowBookingChoice] = useState(false);
  const [bookingMode, setBookingMode] = useState(null); // 'new' or 'registered'
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [newUnavailableDate, setNewUnavailableDate] = useState('');
  const [unavailLoading, setUnavailLoading] = useState(false);

  // Settings dropdown state
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const settingsDropdownRef = useRef(null);

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', error: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchAvailability();
    fetchUnavailableDates();

    // Click outside listener for settings dropdown
    const handleClickOutside = (event) => {
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ message: '', error: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ message: '', error: 'New password must be at least 8 characters long' });
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordStatus({ 
        message: '', 
        error: 'your new password is the same in the current, you must create new one and unique password make sure that is not the same in the current password' 
      });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus({ message: '', error: '' });
    try {
      await api.patch('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordStatus({ message: 'Password updated successfully!', error: '' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err) {
      setPasswordStatus({ message: '', error: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data);
      const newStats = data.reduce((acc, appt) => {
        acc.total++;
        if (appt.status === 'confirmed') acc.confirmed++;
        if (appt.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, confirmed: 0, completed: 0 });
      setStats(newStats);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const res = await api.get('/auth/me');
      setIsAvailable(res.data.is_available ?? true);
    } catch {
      // defaults to true
    }
  };

  const fetchUnavailableDates = async () => {
    try {
      const res = await api.get('/auth/unavailable-dates');
      setUnavailableDates(res.data);
    } catch (err) {
      console.error('Failed to fetch unavailable dates', err);
    }
  };

  const handleToggleAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const newVal = !isAvailable;
      await api.patch('/auth/availability', { is_available: newVal });
      setIsAvailable(newVal);
    } catch (err) {
      alert('Failed to update availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleAddUnavailableDate = async () => {
    if (!newUnavailableDate) return;
    setUnavailLoading(true);
    try {
      await api.post('/auth/unavailable-dates', { date: newUnavailableDate });
      setNewUnavailableDate('');
      fetchUnavailableDates();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add unavailable date.');
    } finally {
      setUnavailLoading(false);
    }
  };

  const handleRemoveUnavailableDate = async (id) => {
    try {
      await api.delete(`/auth/unavailable-dates/${id}`);
      setUnavailableDates(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      alert('Failed to remove date.');
    }
  };

  // Appointments 
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      fetchAppointments();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleResetPatientPassword = async (patientId, patientName) => {
    if (window.confirm(`Reset password for ${patientName} to the temporary format?`)) {
      try {
        const res = await api.patch(`/auth/reset-temp-password/${patientId}`);
        alert(`Password for ${patientName} reset to: ${res.data.tempPassword}`);
      } catch (err) {
        console.error('Failed to reset password', err);
        alert(err.response?.data?.message || 'Failed to reset password. Note: Only Admin can reset Doctor passwords.');
      }
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) return;
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  /**
   * Safely extract the intended calendar date (YYYY-MM-DD) from any format
   * node-postgres may return:
   *   - After db.js fix  →  "2026-04-08"  (plain string)
   *   - Before db.js fix →  "2026-04-07T16:00:00.000Z"  (UTC-midnight of PHT date)
   * In both cases we want "2026-04-08".
   */
  const parseDateStr = (val) => {
    if (!val) return '';
    const s = String(val);
    // Plain YYYY-MM-DD — already correct
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // ISO timestamp: node-postgres stored PHT midnight as UTC.
    // Use local (browser) date which reverse-shifts back to the correct calendar day.
    const d = new Date(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm} PHT`;
  };


  const isAppointmentPast = (dateVal, timeStr) => {
    if (!dateVal || !timeStr) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const [year, month, day] = parseDateStr(dateVal).split('-').map(Number);
    // Build the appointment datetime in local time (PHT)
    const apptDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0);
    return apptDateTime < new Date();
  };


  const formatDisplayDate = (dateVal) => {
    const s = parseDateStr(dateVal);
    if (!s) return '';
    const [year, month, day] = s.split('-').map(Number);
    return new Date(year, month - 1, day)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md border-slate-200">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1089d3] to-[#12b1d1] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200/50 transform hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img src="/doctor.png" alt="Doctor Portal" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight text-slate-900">
                Doctor <span className="text-[#1089d3]">Portal</span>
              </h1>
              <p className="mt-1 text-xs font-medium text-slate-500">Dental CarePlus Management</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden text-right md:block">
              <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400 font-bold">Welcome</p>
              <p className="text-sm font-bold text-slate-900">Dr. {user?.name || 'Doctor'}</p>
            </div>

            {/* Settings Dropdown */}
            <div className="relative" ref={settingsDropdownRef}>
              <button
                onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                className={`p-2.5 rounded-xl border-2 transition-all duration-300 shadow-sm flex items-center justify-center ${
                  showSettingsDropdown 
                    ? 'border-slate-900 bg-slate-900 text-white' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900'
                }`}
                title="Settings"
              >
                <FiSettings size={20} />
              </button>

              {showSettingsDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Settings</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordChange(true);
                      setShowSettingsDropdown(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-[#1089d3] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1089d3]">
                      <FiLock size={16} />
                    </div>
                    Change Password
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
            >
              <span>Logout</span>
              <FiXCircle className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <StyledWrapper>
          {/* Welcome Section */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="mb-2 text-3xl font-black text-slate-900">Hello, Dr. {user?.name?.split(' ')[0]} 👋</h2>
              <p className="font-medium text-slate-500">Here's what's happening with your appointments today.</p>
            </div>
            <button
              onClick={() => setShowBookingChoice(true)}
              className="bg-[#1089d3] text-white px-6 py-3.5 rounded-xl hover:bg-[#0d73b0] transition-colors font-bold shadow-md shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <FiPlus size={20} />
              Book Walk-in Patient
            </button>
          </div>

          {showBookingChoice && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300 relative">
                <button 
                  onClick={() => setShowBookingChoice(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <FiXCircle size={24} />
                </button>
                <h3 className="text-xl font-black text-slate-900 mb-2 text-center">Book Walk-in Patient</h3>
                <p className="text-slate-500 text-sm font-medium mb-8 text-center">Choose how you want to book the appointment.</p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setBookingMode('registered');
                      setShowForm(true);
                      setShowBookingChoice(false);
                    }}
                    className="w-full p-6 text-left border-2 border-slate-100 rounded-2xl hover:border-[#1089d3] hover:bg-blue-50 transition-all group"
                  >
                    <p className="font-black text-slate-900 group-hover:text-[#1089d3]">Book Appointment with Already Registered Account</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Search for an existing patient and pre-fill their details.</p>
                  </button>

                  <button
                    onClick={() => {
                      setBookingMode('new');
                      setShowForm(true);
                      setShowBookingChoice(false);
                    }}
                    className="w-full p-6 text-left border-2 border-slate-100 rounded-2xl hover:border-[#1089d3] hover:bg-blue-50 transition-all group"
                  >
                    <p className="font-black text-slate-900 group-hover:text-[#1089d3]">Book Appointment and Create New Account</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Register a new patient and schedule their first visit.</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {showForm && bookingMode === 'new' && (
            <WalkinAppointmentForm
              currentDentistId={user?.id}
              onClose={() => {
                setShowForm(false);
                setBookingMode(null);
              }}
              onSuccess={fetchAppointments}
            />
          )}

          {showForm && bookingMode === 'registered' && (
            <WalkinRegisteredForm
              currentDentistId={user?.id}
              onClose={() => {
                setShowForm(false);
                setBookingMode(null);
              }}
              onSuccess={fetchAppointments}
            />
          )}

          {showPasswordChange && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300 relative">
                <button 
                  onClick={() => setShowPasswordChange(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                >
                  <FiXCircle size={24} />
                </button>
                <h3 className="text-xl font-black text-slate-900 mb-2">Change Password</h3>
                <p className="text-slate-500 text-sm font-medium mb-6">Update your security credentials.</p>
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordStatus.message && <p className="text-sm font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl">{passwordStatus.message}</p>}
                  {passwordStatus.error && <p className="text-sm font-bold text-rose-600 bg-rose-50 p-3 rounded-xl">{passwordStatus.error}</p>}
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#1089d3]/20 focus:outline-none" 
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#1089d3]/20 focus:outline-none" 
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#1089d3]/20 focus:outline-none" 
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full py-4 font-black text-white transition-all bg-[#1089d3] shadow-lg hover:bg-[#0d73b0] rounded-2xl shadow-blue-500/20 disabled:opacity-50 mt-2"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Total Appointments', value: stats.total, img: '/appointment.png', color: 'blue' },
              { label: 'Confirmed Today', value: stats.confirmed, img: '/confirm.png', color: 'emerald' },
              { label: 'Completed', value: stats.completed, img: '/complete.png', color: 'indigo' }
            ].map((stat, i) => (
              <div key={i} className={`stat-card border-l-4 border-${stat.color}-500 group`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`icon-box bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                    <img src={stat.img} alt={stat.label} className="w-6 h-6 object-contain" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/*  AVAILABILITY SECTION */}
          <div className="mb-10 overflow-hidden bg-white border shadow-sm rounded-3xl border-slate-200">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <img src="/available.png" alt="Availability" className="w-5 h-5 object-contain" />
                Availability Settings
              </h3>
              <p className="mt-1 text-sm text-slate-500">Manage when you're available for patient bookings.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
              {/* Toggle */}
              <div className="flex items-center justify-between p-6 border rounded-2xl border-slate-100 bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800">Availability Status</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {isAvailable ? 'You are visible to patients for booking.' : 'You are hidden from the booking system.'}
                  </p>
                </div>
                <button
                  onClick={handleToggleAvailability}
                  disabled={availabilityLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${isAvailable
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    } disabled:opacity-60`}
                >
                  {isAvailable ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                  {availabilityLoading ? 'Saving...' : isAvailable ? 'Available' : 'Unavailable'}
                </button>
              </div>

              {/* Unavailable Dates */}
              <div className="p-6 border rounded-2xl border-slate-100 bg-slate-50">
                <p className="mb-4 font-bold text-slate-800">Mark Unavailable Dates</p>
                <div className="flex gap-2 mb-4">
                  <input
                    type="date"
                    value={newUnavailableDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setNewUnavailableDate(e.target.value)}
                    className="flex-1 text-sm font-medium border border-slate-200 rounded-xl px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#1089d3]/30"
                  />
                  <button
                    onClick={handleAddUnavailableDate}
                    disabled={!newUnavailableDate || unavailLoading}
                    className="flex items-center gap-1 px-4 py-2 bg-[#1089d3] text-white rounded-xl text-sm font-bold hover:bg-[#0d73b0] transition-colors disabled:opacity-50"
                  >
                    <FiPlus size={16} />
                    {unavailLoading ? 'Adding...' : 'Add'}
                  </button>
                </div>
                <div className="space-y-2 overflow-y-auto max-h-40">
                  {unavailableDates.length > 0 ? unavailableDates.map(d => (
                    <div key={d.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-4 py-2.5">
                      <span className="text-sm font-semibold text-slate-700">{formatDisplayDate(d.unavailable_date)}</span>
                      <button
                        onClick={() => handleRemoveUnavailableDate(d.id)}
                        className="p-1 transition-colors rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  )) : (
                    <p className="py-4 text-xs italic text-center text-slate-400">No unavailable dates set.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Appointments Table Section */}
          <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-slate-200 shadow-slate-200/50">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <img src="/appointments.png" alt="Schedule" className="w-5 h-5 object-contain" />
                Appointment Schedule
              </h3>
              <button
                onClick={fetchAppointments}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-[#1089d3]"
              >
                <FiLoader className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {loading ? (
              <div className="p-20 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#1089d3] mb-4"></div>
                <p className="font-medium text-slate-500">Analyzing schedules...</p>
              </div>
            ) : error ? (
              <div className="p-20 text-center">
                <div className="inline-block p-4 mb-4 border bg-rose-50 text-rose-500 rounded-2xl border-rose-100">
                  <FiXCircle size={32} />
                </div>
                <p className="font-bold text-slate-700">{error}</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-20 text-center">
                <div className="inline-block p-4 mb-4 border bg-slate-50 text-slate-400 rounded-2xl border-slate-100">
                  <FiCalendar size={32} />
                </div>
                <p className="text-lg font-bold text-slate-700">No appointments found</p>
                <p className="text-slate-500">Your schedule is currently clear.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt) => {
                      const isPast = isAppointmentPast(appt.appointment_date, appt.appointment_time);
                      return (
                        <tr key={appt.id} className="transition-colors hover:bg-slate-50/50 group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 font-bold border-2 border-white rounded-full shadow-sm bg-slate-100 text-slate-500">
                                {appt.client_name?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{appt.client_name}</p>
                                <p className="text-[10px] font-medium text-slate-400">ID: #{appt.id.toString().slice(0, 5)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-sm font-medium text-slate-700">{appt.service_name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                {(() => {
                                  const [y, m, d] = parseDateStr(appt.appointment_date).split('-').map(Number);
                                  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                })()}
                              </p>
                              <p className="text-xs font-medium text-[#1089d3]">{formatTime12h(appt.appointment_time)}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(appt.status)}`}>
                              {appt.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 transition-opacity opacity-0 group-hover:opacity-100">
                              <button
                                onClick={() => handleResetPatientPassword(appt.client_id, appt.client_name)}
                                className="p-2 transition-all duration-200 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                                title="Reset patient password"
                              >
                                <FiActivity />
                              </button>
                              {appt.status === 'confirmed' && (
                                isPast ? (
                                  <button
                                    onClick={() => handleStatusUpdate(appt.id, 'completed')}
                                    className="p-2 text-blue-600 transition-all duration-200 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white"
                                    title="Mark as Completed"
                                  >
                                    <FiActivity />
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="p-2 rounded-lg cursor-not-allowed text-slate-300 bg-slate-50"
                                    title="Appointment has not occurred yet"
                                  >
                                    <FiActivity />
                                  </button>
                                )
                              )}
                              {appt.status === 'confirmed' && (
                                <button
                                  onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                  className="p-2 transition-all duration-200 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                                  title="Cancel Appointment"
                                >
                                  <FiXCircle />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </StyledWrapper>
      </main>
    </div>
  );
};

const StyledWrapper = styled.div`
  .stat-card {
    background: white;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    border: 1px solid #e2e8f0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
  }

  .icon-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  /* Stat card border colors (safelist for tailwind if needed) */
  .border-blue-500 { border-left-color: #3b82f6; }
  .border-emerald-500 { border-left-color: #10b981; }
  .border-indigo-500 { border-left-color: #6366f1; }
  
  .bg-blue-50 { background-color: #eff6ff; }
  .bg-emerald-50 { background-color: #ecfdf5; }
  .bg-indigo-50 { background-color: #eef2ff; }
  
  .text-blue-600 { color: #2563eb; }
  .text-emerald-600 { color: #059669; }
  .text-indigo-600 { color: #4f46e5; }
`;

export default DoctorDashboard;
