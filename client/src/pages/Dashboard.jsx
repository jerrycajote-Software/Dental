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
        return <span className="px-3 py-1 bg-blue-100/50 text-blue-600 text-xs font-bold rounded-full">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100/50 text-emerald-600 text-xs font-bold rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100/50 text-red-600 text-xs font-bold rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-amber-100/50 text-amber-600 text-xs font-bold rounded-full capitalize">{status}</span>;
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

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  return (
    <div className="min-h-screen bg-[#e7f0fa] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-4 mb-2">
          {['Overview', 'Settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                activeTab === tab 
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  Welcome back, {user?.name ? user.name.split(' ')[0] : 'John'}!
                </h2>
                <p className="text-slate-500 font-medium mt-2 text-md">
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
            <h3 className="text-2xl font-black text-slate-900 mb-8">Account Settings</h3>
            
            <div className="space-y-10">
              <div className="p-8 rounded-3xl bg-red-50 border border-red-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-red-600">Delete Account</h4>
                    <p className="text-sm font-medium text-red-400 max-w-md">
                      Permanently remove your account and all associated data. You won't be able to re-register with this email address for 24 hours.
                    </p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MAIN COLUMN (Upcoming Appointment + Quick Actions ) */}
          <div className="lg:col-span-2 space-y-6">

            {/* UPCOMING APPOINTMENT WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between bg-white/50">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-600" size={20} />
                  <h3 className="text-[17px] font-bold text-slate-800">Upcoming Appointment</h3>
                </div>
                {nextAppointment ? getStatusBadge(nextAppointment.status) : null}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="animate-pulse flex flex-col items-center py-8 text-slate-400">
                    Loading...
                  </div>
                ) : nextAppointment ? (
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full bg-blue-100/50 text-blue-600 shrink-0">
                      <span className="text-2xl font-black leading-none">
                        {new Date(nextAppointment.appointment_date).getDate()}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-slate-900">Dr. {nextAppointment.dentist_name}</h4>
                      <p className="text-sm font-medium text-slate-500 mt-1">
                        Dentist • {nextAppointment.service_name}
                      </p>

                      <div className="flex items-center gap-4 mt-6">
                        <button 
                          onClick={() => handleReschedule(nextAppointment)}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          Reschedule
                        </button>
                        <button 
                          onClick={() => handleCancel(nextAppointment.id)}
                          className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 text-sm font-medium text-slate-600 sm:items-end">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-slate-400" />
                        <span>{formatTime12h(nextAppointment.appointment_time)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 font-medium">No upcoming appointments scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            {/* APPOINTMENT HISTORY WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
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

          {/* SIDE COLUMN (Quick Actions) */}
          <div className="space-y-6">

            {/* QUICK ACTIONS WIDGET */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-[17px] font-bold text-slate-800 mb-6">Quick Actions</h3>

              <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#f0fdf4]/70 hover:bg-[#f0fdf4] transition-colors group cursor-pointer border border-transparent hover:border-green-100">
                  <FileText size={28} className="text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-bold text-emerald-600">Records</span>
                </button>

                <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#faf5ff]/70 hover:bg-[#faf5ff] transition-colors group cursor-pointer border border-transparent hover:border-purple-100">
                  <Activity size={28} className="text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-bold text-purple-600">Treatments</span>
                </button>

                <button className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-[#fff7ed]/70 hover:bg-[#fff7ed] transition-colors group cursor-pointer border border-transparent hover:border-orange-100">
                  <UserIcon size={28} className="text-orange-600 group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-sm font-bold text-orange-600">Profile</span>
                </button>
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
            <div className="p-20 text-center text-slate-400 font-bold italic">
              <div className="animate-pulse flex flex-col items-center">
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
                        <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                          <Clock size={16} className="text-[#a1c4fd]" />
                          {new Date(apt.appointment_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {formatTime12h(apt.appointment_time)}
                        </p>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Dentist: {apt.dentist_name}</p>
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
                        className="text-red-500 hover:text-red-700 text-sm font-black hover:underline transition-all underline-offset-4"
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
              <p className="text-slate-500 font-bold text-lg">You don't have any appointments yet.</p>
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
