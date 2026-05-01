import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  MapPin, Plus, FileText, Activity, User as UserIcon, Bell
} from 'lucide-react';
import authService from '../services/authService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [fetchingNotifications, setFetchingNotifications] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', error: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

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
      const response = await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus({ message: response.message, error: '' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus({ message: '', error: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    fetchAppointments();
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/web');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/web/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/web/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone, and you won't be able to re-register with this email for 24 hours."
    );

    if (confirmation) {
      try {
        setDeleting(true);
        await authService.deleteAccount();
        alert('Your account has been deleted. You will now be logged out.');
        logout();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete account');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(id);
        fetchAppointments();
      } catch (err) {
        alert('Failed to cancel appointment');
      }
    }
  };

  // ... (getStatusBadge, getStatusColor, etc. remain same)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 text-xs font-bold text-blue-600 rounded-full bg-blue-100/50">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100/50 text-emerald-600">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 text-xs font-bold text-red-600 rounded-full bg-red-100/50">Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold capitalize rounded-full bg-amber-100/50 text-amber-600">{status}</span>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpcoming = upcomingAppointments
    .filter(a => (a.appointment_date || '').slice(0, 10) === todayStr)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const nextAppointment = todayUpcoming.length > 0
    ? todayUpcoming[0]
    : upcomingAppointments
        .filter(a => (a.appointment_date || '').slice(0, 10) > todayStr)
        .sort((a, b) => {
          const dateCompare = (a.appointment_date || '').localeCompare(b.appointment_date || '');
          return dateCompare !== 0 ? dateCompare : a.appointment_time.localeCompare(b.appointment_time);
        })[0] || null;

  return (
    <div className="min-h-screen bg-[#e7f0fa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* NAVIGATION TABS */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {[
              { id: 'Overview', label: 'Overview', icon: '/overview.png' },
              { id: 'Notifications', label: 'Notifications', icon: '/bell.png' },
              { id: 'Settings', label: 'Settings', icon: '/settings.png' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all relative ${activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-white hover:text-slate-800'
                  }`}
              >
                <img src={tab.icon} alt={tab.label} className={`w-4 h-4 object-contain ${activeTab === tab.id ? 'brightness-0 invert' : 'opacity-70'}`} />
                {tab.label}
                {tab.id === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'Overview' ? (
          <>
            {/* HEADER SECTION */}
            <div className="flex flex-col items-start justify-between gap-6 mb-2 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  Welcome back, {user?.name ? user.name.split(' ')[0] : 'John'}!
                </h2>
                <p className="mt-2 font-medium text-slate-500 text-md">
                  Here is your dental health overview.
                </p>
              </div>
            </div>

            {/* ... rest of the Overview content ... */}
          </>
        ) : activeTab === 'Notifications' ? (
          /* NOTIFICATIONS TAB */
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-blue-50 p-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Notifications</h3>
                <p className="mt-1 font-medium text-slate-500 text-sm">Stay updated with your appointment activities.</p>
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notifications.length > 0 ? (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                      n.is_read 
                        ? 'bg-white border-slate-50 opacity-60' 
                        : 'bg-blue-50/30 border-blue-100 shadow-sm'
                    } hover:border-blue-200 hover:bg-blue-50/50 group`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        n.is_read ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      }`}>
                        <Bell size={18} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className={`font-black text-sm ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                            {n.title}
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">
                            {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(n.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`mt-1 text-sm font-medium leading-relaxed ${n.is_read ? 'text-slate-500' : 'text-slate-600'}`}>
                          {n.message}
                        </p>
                      </div>
                      {!n.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-24 px-10 bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 shadow-inner">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-100 blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative h-20 w-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-slate-300 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <Bell size={40} />
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2">Your notification center is empty</h4>
                  <p className="max-w-xs text-center text-sm font-medium text-slate-500 leading-relaxed">
                    We'll keep you posted here when there are updates to your appointments or clinic news.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SETTINGS TAB  */
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-blue-50 p-10">
            <h3 className="mb-8 text-2xl font-black text-slate-900">Account Settings</h3>

            <div className="space-y-10">
              {/* CHANGE PASSWORD SECTION */}
              <div className="p-8 border border-slate-100 rounded-3xl bg-slate-50/50">
                <h4 className="mb-4 text-lg font-black text-slate-800">Change Password</h4>
                <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                  {passwordStatus.message && <p className="text-sm font-bold text-emerald-600">{passwordStatus.message}</p>}
                  {passwordStatus.error && <p className="text-sm font-bold text-rose-600">{passwordStatus.error}</p>}
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-400">Current Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-100" 
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-400">New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-100" 
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold tracking-wider uppercase text-slate-400">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      className="w-full p-4 text-sm font-bold bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-100" 
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={passwordLoading}
                    className="px-8 py-4 font-black text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-700 rounded-2xl shadow-blue-600/20 disabled:opacity-50"
                  >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="p-8 border border-red-100 rounded-3xl bg-red-50">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-red-600">Delete Account</h4>
                    <p className="max-w-md text-sm font-medium text-red-400">
                      Permanently remove your account and all associated data. You won't be able to re-register with this email address for 24 hours.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-8 py-4 font-black text-white transition-all bg-red-600 shadow-lg hover:bg-red-700 rounded-2xl shadow-red-600/20 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Remove showForm */ }

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* MAIN COLUMN */}
          <div className="space-y-6 lg:col-span-2">

            {/* UPCOMING APPOINTMENTS LIST */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-white/50">
                <div className="flex items-center gap-3">
                  <img src="/appointments.png" alt="Upcoming Appointments" className="object-contain w-8 h-8"/>
                  <h3 className="text-[17px] font-bold text-slate-800">Upcoming Appointments</h3>
                </div>
                <span className="px-3 py-1 text-xs font-bold text-blue-500 rounded-full bg-blue-50">
                  {upcomingAppointments.length} scheduled
                </span>
              </div>

              <div>
                {loading ? (
                  <div className="flex flex-col items-center py-8 text-sm animate-pulse text-slate-400">
                    Loading...
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="divide-y divide-slate-50 max-h-[420px] overflow-y-auto">
                    {upcomingAppointments
                      .slice()
                      .sort((a, b) => {
                        const dateCompare = new Date(a.appointment_date) - new Date(b.appointment_date);
                        return dateCompare !== 0 ? dateCompare : a.appointment_time.localeCompare(b.appointment_time);
                      })
                      .map(apt => (
                        <div key={apt.id} className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/60 sm:flex-row sm:items-center">
                          
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center font-black leading-none text-blue-600 w-14 h-14 rounded-2xl bg-blue-50 shrink-0">
                              <span className="text-xl">
                                {new Date(apt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })}
                              </span>
                              <span className="text-[10px] font-bold text-blue-400 uppercase">
                                {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                              </span>
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{apt.service_name}</p>
                              <p className="text-sm font-medium text-slate-500">Dr. {apt.dentist_name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-xs font-semibold text-slate-500">{formatTime12h(apt.appointment_time)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                            {getStatusBadge(apt.status)}
                            <button
                              onClick={() => handleCancel(apt.id)}
                              className="text-xs font-bold text-red-400 transition-colors hover:text-red-600"
                            >
                              Cancel
                            </button>
                          </div>
                          
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="font-medium text-slate-500">No upcoming appointments scheduled.</p>
                  </div>
                )}
              </div>
            </div>


            {/* APPOINTMENT HISTORY */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
              <div className="px-6 py-6 border-b border-slate-50 bg-white/50">
                <h3 className="text-[17px] font-bold text-slate-800">Appointment History</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Date</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Doctor</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Type</th>
                      <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Past appointments  */}
                    {pastAppointments.slice(0, 3).map(apt => (
                      <tr key={apt.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-800">
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                        </td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-800">Dr. {apt.dentist_name}</td>
                        <td className="px-6 py-5 text-sm font-medium text-slate-500">{apt.service_name}</td>
                        <td className="px-6 py-5">{getStatusBadge(apt.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

       
        {/* <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-blue-50 mt-12">
          <div className="bg-[#a1c4fd]/10 px-8 py-6 border-b border-blue-50">
            <h3 className="text-xl font-black text-[#1a237e]">All Appointments</h3>
          </div>

          {loading ? (
            <div className="p-20 italic font-bold text-center text-slate-400">
              <div className="flex flex-col items-center animate-pulse">
                <Calendar size={48} className="mb-4 opacity-50" />
                Loading your appointments...
              </div>
            </div>
          ) : appointments.length > 0 ? (
            <div className="divide-y divide-blue-50">
              {appointments.map((apt) => (
                <div key={apt.id} className="p-8 hover:bg-[#f0f7ff]/50 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-6">
                    <div className="bg-[#a1c4fd]/20 p-4 rounded-2xl text-[#1a237e] shadow-inner">
                      <Calendar size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{apt.service_name}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <Clock size={16} className="text-[#a1c4fd]" />
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime12h(apt.appointment_time)}
                        </p>
                        <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Dentist: {apt.dentist_name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(apt.id)}
                        className="text-sm font-black text-red-500 transition-all hover:text-red-700 hover:underline underline-offset-4"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="bg-[#f0f7ff] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-[#a1c4fd] shadow-inner">
                <AlertCircle size={40} />
              </div>
              <p className="text-lg font-bold text-slate-500">You don't have any appointments yet.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-6 text-[#1a237e] font-black hover:underline underline-offset-4"
              >
                Book your first visit today
              </button>
            </div>
          )}
        </div> */}

      </div>
    </div>
  );
};

export default Dashboard;
