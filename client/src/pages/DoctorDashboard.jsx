import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import styled from 'styled-components';
import { 
  FiCalendar, 
  FiUsers, 
  FiCheckCircle, 
  FiClock, 
  FiMoreVertical, 
  FiXCircle, 
  FiLoader,
  FiActivity
} from 'react-icons/fi';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getAppointments();
      setAppointments(data);
      
      // Calculate stats
      const newStats = data.reduce((acc, appt) => {
        acc.total++;
        if (appt.status === 'pending') acc.pending++;
        if (appt.status === 'confirmed') acc.confirmed++;
        if (appt.status === 'completed') acc.completed++;
        return acc;
      }, { total: 0, pending: 0, confirmed: 0, completed: 0 });
      setStats(newStats);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      // Update local state instead of re-fetching everything
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status: newStatus } : appt
      ));
      
      // Update stats based on the change
      fetchAppointments(); 
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Format time to 12-hour PHT display
  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm} PHT`;
  };

  // Returns true if the appointment date+time has already passed (PHT = UTC+8)
  const isAppointmentPast = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    const [hours, minutes] = timeStr.split(':').map(Number);
    // appointment_date from DB is already UTC midnight; get local date parts
    const apptDate = new Date(dateStr);
    // Build a Date using the date components and appointment time in PHT (UTC+8)
    const apptDateTime = new Date(
      apptDate.getUTCFullYear(),
      apptDate.getUTCMonth(),
      apptDate.getUTCDate(),
      hours,
      minutes
    );
    // Compare against current PHT time
    const nowPHT = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    return apptDateTime < nowPHT;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-md border-slate-200">
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1089d3] to-[#12b1d1] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200/50 transform hover:scale-105 transition-transform duration-300">
              <FiActivity size={24} />
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
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-black text-slate-900">Hello, Dr. {user?.name?.split(' ')[0]} 👋</h2>
            <p className="font-medium text-slate-500">Here's what's happening with your appointments today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 mb-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Appointments', value: stats.total, icon: <FiCalendar />, color: 'blue' },
              { label: 'Pending Approval', value: stats.pending, icon: <FiClock />, color: 'amber' },
              { label: 'Confirmed Today', value: stats.confirmed, icon: <FiUsers />, color: 'emerald' },
              { label: 'Completed', value: stats.completed, icon: <FiCheckCircle />, color: 'indigo' }
            ].map((stat, i) => (
              <div key={i} className={`stat-card border-l-4 border-${stat.color}-500 group`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold tracking-wider uppercase text-slate-500">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`icon-box bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Appointments Table Section */}
          <div className="overflow-hidden bg-white border shadow-xl rounded-3xl border-slate-200 shadow-slate-200/50">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <FiUsers className="text-[#1089d3]" />
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
                    {appointments.map((appt) => (
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
                              {new Date(appt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
                            {appt.status === 'pending' && (
                              <button 
                                onClick={() => handleStatusUpdate(appt.id, 'confirmed')}
                                className="p-2 transition-all duration-200 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                title="Confirm Appointment"
                              >
                                <FiCheckCircle />
                              </button>
                            )}
                            {appt.status === 'confirmed' && (
                              isAppointmentPast(appt.appointment_date, appt.appointment_time) ? (
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
                                  className="p-2 text-slate-300 rounded-lg bg-slate-50 cursor-not-allowed"
                                  title="Appointment has not occurred yet"
                                >
                                  <FiActivity />
                                </button>
                              )
                            )}
                            {(appt.status === 'pending' || appt.status === 'confirmed') && (
                              <button 
                                onClick={() => handleStatusUpdate(appt.id, 'cancelled')}
                                className="p-2 transition-all duration-200 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
                                title="Cancel Appointment"
                              >
                                <FiXCircle />
                              </button>
                            )}
                            <button className="p-2 transition-all duration-200 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-200">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
  .border-amber-500 { border-left-color: #f59e0b; }
  .border-emerald-500 { border-left-color: #10b981; }
  .border-indigo-500 { border-left-color: #6366f1; }
  
  .bg-blue-50 { background-color: #eff6ff; }
  .bg-amber-50 { background-color: #fffbeb; }
  .bg-emerald-50 { background-color: #ecfdf5; }
  .bg-indigo-50 { background-color: #eef2ff; }
  
  .text-blue-600 { color: #2563eb; }
  .text-amber-600 { color: #d97706; }
  .text-emerald-600 { color: #059669; }
  .text-indigo-600 { color: #4f46e5; }
`;

export default DoctorDashboard;
