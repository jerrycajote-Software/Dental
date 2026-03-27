import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  MapPin, Plus, FileText, Activity, User as UserIcon
} from 'lucide-react';
import AppointmentForm from '../components/AppointmentForm';
import authService from '../services/authService';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [deleting, setDeleting] = useState(false);
  const [reschedulingAppointment, setReschedulingAppointment] = useState(null);

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
  }, []);

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

  const handleReschedule = (appointment) => {
    setReschedulingAppointment(appointment);
    setShowForm(true);
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

  // Prioritize soonest appointment today; fall back to next future appointment
  const todayStr = new Date().toISOString().split('T')[0];
  const todayUpcoming = upcomingAppointments
    .filter(a => new Date(a.appointment_date).toISOString().split('T')[0] === todayStr)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

  const nextAppointment = todayUpcoming.length > 0
    ? todayUpcoming[0]
    : upcomingAppointments
        .filter(a => new Date(a.appointment_date).toISOString().split('T')[0] > todayStr)
        .sort((a, b) => {
          const dateCompare = new Date(a.appointment_date) - new Date(b.appointment_date);
          return dateCompare !== 0 ? dateCompare : a.appointment_time.localeCompare(b.appointment_time);
        })[0] || null;

  return (
    <div className="min-h-screen bg-[#e7f0fa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-4 mb-2">
          {['Overview', 'Settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }`}
            >
              {tab}
            </button>
          ))}
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
              <button
                onClick={() => {
                  setReschedulingAppointment(null);
                  setShowForm(true);
                }}
                className="w-full md:w-auto bg-[#1d4ed8] text-white px-6 py-3.5 rounded-xl hover:bg-blue-800 transition-all duration-300 shadow-md shadow-blue-900/10 font-bold flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Book New Appointment</span>
              </button>
            </div>

            {/* ... rest of the Overview content ... */}
          </>
        ) : (
          /* SETTINGS TAB CONTENT */
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-blue-50 p-10">
            <h3 className="mb-8 text-2xl font-black text-slate-900">Account Settings</h3>

            <div className="space-y-10">
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

        {showForm && (
          <AppointmentForm
            appointment={reschedulingAppointment}
            onClose={() => {
              setShowForm(false);
              setReschedulingAppointment(null);
            }}
            onSuccess={fetchAppointments}
          />
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* MAIN COLUMN (Upcoming Appointment + Quick Actions ) */}
          <div className="space-y-6 lg:col-span-2">

            {/* UPCOMING APPOINTMENTS LIST */}
            <div className="overflow-hidden bg-white border shadow-sm rounded-2xl border-slate-100">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 bg-white/50">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={20} />
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
                                {new Date(apt.appointment_date).getUTCDate()}
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
                              onClick={() => handleReschedule(apt)}
                              className="text-xs font-bold text-blue-500 transition-colors hover:text-blue-700"
                            >
                              Reschedule
                            </button>
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


            {/* APPOINTMENT HISTORY WIDGET */}
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
                    {/* Past appointments will be rendered below dynamically from the database */}
                    {pastAppointments.slice(0, 3).map(apt => (
                      <tr key={apt.id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-5 text-sm font-medium text-slate-800">
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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

        {/* ORIGINAL WIDGET RESTORED */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-blue-50 mt-12">
          <div className="bg-[#a1c4fd]/10 px-8 py-6 border-b border-blue-50">
            <h3 className="text-xl font-black text-[#1a237e]">All Appointments</h3>
          </div>

          {loading ? (
            <div className="p-20 italic font-bold text-center text-slate-400">
              <div className="flex flex-col items-center animate-pulse">
                <Calendar size={48} className="mb-4 opacity-20" />
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
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
