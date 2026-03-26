import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import api from '../services/api';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Activity,
  FileText,
  Settings,
  Search,
  Bell,
  LogOut,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  ChevronRight,
  Stethoscope,
  MapPin,
  CalendarCheck,
  Phone,
  Plus,
  Mail,
  User,
  Lock,
  Moon,
  Globe,
  Save,
  Smartphone
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// No dummy data for the chart - we will use real data or empty state
const chartData = [];

// Helper to get initials
const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState('General');
  const [appointments, setAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Doctor management state
  const [doctors, setDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '' });
  const [doctorError, setDoctorError] = useState('');
  const [doctorSuccess, setDoctorSuccess] = useState('');
  const [isCreatingDoctor, setIsCreatingDoctor] = useState(false);

  // Patient management state
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  // ... (fetchAppointments, handleStatusChange, handleDelete remain same)

  // Patient management functions
  const fetchPatients = async () => {
    try {
      const response = await api.get('/auth/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  };

  const handleDeletePatient = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s account?`)) {
      try {
        await api.delete(`/auth/patients/${id}`);
        fetchPatients();
      } catch (err) {
        console.error('Failed to delete patient', err);
      }
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, status);
      fetchAppointments();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.deleteAppointment(id);
        fetchAppointments();
      } catch (err) {
        console.error('Failed to delete appointment', err);
      }
    }
  };

  // Doctor management functions
  const fetchDoctors = async () => {
    try {
      const response = await api.get('/auth/doctors');
      setDoctors(response.data);
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDoctorError('');
    setDoctorSuccess('');
    setIsCreatingDoctor(true);
    if (!doctorForm.email.toLowerCase().endsWith('@gmail.com')) {
      setDoctorError('Doctor account must use a valid Gmail address');
      setIsCreatingDoctor(false);
      return;
    }
    
    try {
      const response = await api.post('/auth/doctors', doctorForm);
      setDoctorSuccess(response.data.message || 'Doctor account created successfully!');
      setDoctorForm({ name: '', email: '', password: '' });
      fetchDoctors();
    } catch (err) {
      setDoctorError(err.response?.data?.message || 'Failed to create doctor account');
    } finally {
      setIsCreatingDoctor(false);
    }
  };

  const handleDeleteDoctor = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${name}'s account?`)) {
      try {
        await api.delete(`/auth/doctors/${id}`);
        fetchDoctors();
      } catch (err) {
        console.error('Failed to delete doctor', err);
      }
    }
  };

  // Sidebar navigation items
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Appointments', icon: Calendar },
    { name: 'Patients', icon: Users },
    { name: 'Doctors', icon: Stethoscope },
    { name: 'Settings', icon: Settings },
  ];

  // Render Status Badge
  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold leading-none bg-emerald-100 text-emerald-600">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold leading-none bg-blue-100 text-blue-600">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold leading-none bg-red-100 text-red-500">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold leading-none bg-amber-100 text-amber-600">Pending</span>;
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = (apt.client_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.dentist_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || apt.status === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#c2e9fb] overflow-hidden text-slate-800 font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#f8fbff] border-r border-slate-200 flex flex-col justify-between shrink-0 h-full">
        <div>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-200">
            <h1 className="text-xl font-bold tracking-tight">
              Dental <span className="text-blue-500">CarePlus</span>
            </h1>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === item.name
                  ? 'bg-blue-100/60 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <item.icon size={18} className={activeTab === item.name ? 'text-blue-500' : 'text-slate-400'} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Doctor Profile"
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Dr. Sarah Smith'}</p>
                <p className="text-xs text-slate-500">View Profile</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-[#f8fbff] flex items-center justify-between px-8 border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="w-72 bg-white border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
              />
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* ---- OVERVIEW TAB ---- */}
          {activeTab === 'Overview' && (
            <>
              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h1>
                <p className="text-slate-500 text-sm">Welcome back, {user?.name || 'Dr. Sarah Smith'}.</p>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-semibold text-slate-500 my-auto">Total Appointments</p>
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{appointments.length}</h3>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    Total in database
                  </p>
                </div>

                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-semibold text-slate-500 my-auto">New Patients</p>
                    <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-sm">
                      <Users size={20} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{[...new Set(appointments.map(a => a.client_id))].length}</h3>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    Unique patients
                  </p>
                </div>


                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs font-semibold text-slate-500 my-auto">Cancelled</p>
                    <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm">
                      <Activity size={20} />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{appointments.filter(a => a.status === 'cancelled').length}</h3>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    Total cancelled
                  </p>
                </div>
              </div>

              {/* LOWER SECTION: CHART & ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Appointments Overview Chart (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Appointments Overview</h3>
                    <select className="text-xs font-semibold text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-slate-700">
                      <option>This Week</option>
                      <option>Last Week</option>
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                          tickCount={5}
                        />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="appointments"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAppointments)"
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recent Activity (Takes 1 column) */}
                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h3>

                  <div className="space-y-6">

                    <div className="p-4 text-center text-sm text-slate-400 italic">
                      No recent activity logged yet.
                    </div>

                  </div>

                  <div className="mt-8 text-center pt-4 border-t border-slate-100">
                    <button className="text-blue-500 text-xs font-bold hover:text-blue-600 transition-colors">
                      View All Activity
                    </button>
                  </div>
                </div>
              </div>

              {/* NEW WIDGETS SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* PATIENT QUEUE */}
                <div className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-[#fcf5ff] p-6 border-b border-pink-50/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="text-[#a855f7]" size={20} />
                      <h3 className="text-lg font-bold text-slate-900">Patient Queue</h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">0 patients waiting</p>
                  </div>
                  {/* List */}
                  <div className="p-6 flex-1 max-h-[350px] overflow-y-auto">
                    <div className="space-y-4">
                      <p className="text-center text-xs text-slate-400 py-8 italic">No patients in queue</p>
                    </div>
                  </div>
                </div>

                {/* RECENT PATIENTS */}
                <div className="bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                  {/* Header */}
                  <div className="bg-[#f0fdf4] p-6 border-b border-green-50/50">
                    <div className="flex items-center gap-2">
                      <FileText className="text-green-600" size={20} />
                      <h3 className="text-lg font-bold text-slate-900">Recent Patients</h3>
                    </div>
                  </div>
                  {/* List */}
                  <div className="p-6 flex-1 max-h-[350px] overflow-y-auto">
                    <div className="space-y-4">
                      <p className="text-center text-xs text-slate-400 py-8 italic">No recent patients found</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TODAY'S SCHEDULE FULL WIDTH */}
              <div className="mt-8 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-[#f0f9ff] p-6 border-b border-blue-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Today's Schedule</h3>
                  </div>
                  <div className="flex gap-4 text-slate-500">
                    <button><Search size={18} className="hover:text-slate-800 transition-colors" /></button>
                    <button><Filter size={18} className="hover:text-slate-800 transition-colors" /></button>
                  </div>
                </div>
                {/* List */}
                <div className="p-0">
                  <div className="flex flex-col">
                    <p className="text-center text-xs text-slate-400 py-12 italic">No appointments scheduled for today.</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ---- APPOINTMENTS TAB ---- */}
          {activeTab === 'Appointments' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Appointments</h1>
                  <p className="text-slate-500 text-sm">Manage patient bookings and schedules.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                  <Filter size={16} /> Filter View
                </button>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 mb-6 flex justify-between items-center">
                <div className="flex-1 flex items-center pl-3">
                  <Search size={18} className="text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search by patient or doctor..."
                    className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="pl-4 pr-2 border-l border-slate-100">
                  <select
                    className="text-sm font-semibold text-slate-600 outline-none cursor-pointer bg-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fbff] text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Doctor</th>
                      <th className="px-6 py-4">Service</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => {
                        const date = new Date(apt.appointment_date);
                        return (
                          <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                            {/* PATIENT */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#ecf2fa] text-slate-600 flex items-center justify-center text-xs font-bold ring-1 ring-slate-200">
                                  {getInitials(apt.client_name)}
                                </div>
                                <span className="text-sm font-semibold text-slate-800">
                                  {apt.client_name || 'Jerry Cajote'}
                                </span>
                              </div>
                            </td>
                            {/* DATE & TIME */}
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-slate-700">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </div>
                              <div className="text-xs font-medium text-slate-400 mt-0.5">
                                {apt.appointment_time.substring(0, 5)} {parseInt(apt.appointment_time.substring(0, 2)) >= 12 ? 'PM' : 'AM'}
                              </div>
                            </td>
                            {/* DOCTOR */}
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-500">
                                {apt.dentist_name || 'Dr. Sarah Smith'}
                              </span>
                            </td>
                            {/* SERVICE */}
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-slate-400">
                                {apt.service_name || 'Orthodontics'}
                              </span>
                            </td>
                            {/* STATUS */}
                            <td className="px-6 py-4">
                              <StatusBadge status={apt.status} />
                            </td>
                            {/* ACTIONS */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-3 text-slate-400">
                                <button
                                  onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                  title="Confirm"
                                  className="hover:text-emerald-500 transition-colors"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                  title="Reject"
                                  className="hover:text-red-500 transition-colors"
                                >
                                  <XCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(apt.id)}
                                  title="Delete"
                                  className="hover:text-slate-600 transition-colors ml-1"
                                >
                                  <Trash2 size={18} strokeWidth={1.5} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-sm font-medium text-slate-400">
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---- PATIENTS TAB ---- */}
          {activeTab === 'Patients' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Patients</h1>
                  <p className="text-slate-500 text-sm">Manage patient records and history.</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                  <Plus size={16} strokeWidth={2.5} /> Add New Patient
                </button>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 mb-6">
                <div className="flex items-center pl-3 w-full">
                  <Search size={18} className="text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    className="w-full text-sm outline-none placeholder:text-slate-400 text-slate-700 font-medium py-1"
                  />
                </div>
              </div>

              {/* Patients Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden text-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fbff] text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Contact</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <tr key={patient.id} className={`hover:bg-slate-50 transition-colors ${patient.is_deleted ? 'opacity-70 bg-slate-50/30' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${patient.is_deleted ? 'bg-slate-200' : 'bg-blue-100'} shrink-0 overflow-hidden`}>
                                <img
                                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=${patient.is_deleted ? '94a3b8' : '3b82f6'}&color=fff`}
                                  alt="Avatar"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <span className={`text-sm font-bold ${patient.is_deleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                  {patient.name}
                                </span>
                                {patient.is_deleted && (
                                  <div className="text-[10px] font-black text-red-500 uppercase mt-0.5">Deleted Account</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-slate-500">{patient.email}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-slate-500">
                              {new Date(patient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-800">
                            {patient.is_deleted ? (
                              <span className="px-2.5 py-1 bg-red-50 text-red-500 text-[10px] font-bold rounded-full border border-red-100 uppercase tracking-wider">Deleted</span>
                            ) : (
                              <span className={`px-2.5 py-1 ${patient.email_verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'} text-[10px] font-bold rounded-full border uppercase tracking-wider`}>
                                {patient.email_verified ? 'Verified' : 'Unverified'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              {!patient.is_deleted && (
                                <button
                                  onClick={() => handleDeletePatient(patient.id, patient.name)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                  title="Delete patient"
                                >
                                  <Trash2 size={16} strokeWidth={2} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic font-medium">
                          No patient records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ---- DOCTORS TAB ---- */}
          {activeTab === 'Doctors' && (
            <>
              {/* Header */}
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Manage Doctors</h1>
                  <p className="text-slate-500 text-sm">Create and manage doctor accounts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CREATE DOCTOR FORM */}
                <div className="lg:col-span-1 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-[#f0fdf4] p-6 border-b border-green-50/50">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="text-green-600" size={20} />
                      <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">Create a doctor account with verified email</p>
                  </div>

                  <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
                    {doctorError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
                        {doctorError}
                      </div>
                    )}
                    {doctorSuccess && (
                      <div className="bg-green-50 border border-green-200 text-green-600 text-xs font-bold px-4 py-3 rounded-xl">
                        {doctorSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Dr. Full Name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-slate-400"
                          value={doctorForm.name}
                          onChange={(e) => setDoctorForm({ ...doctorForm, name: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          placeholder="doctor@gmail.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-slate-400"
                          value={doctorForm.email}
                          onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          required
                          minLength={8}
                          placeholder="Min 8 characters"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-slate-400"
                          value={doctorForm.password}
                          onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingDoctor}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <Plus size={16} strokeWidth={2.5} />
                      {isCreatingDoctor ? 'Creating...' : 'Create Doctor Account'}
                    </button>
                  </form>
                </div>

                {/* DOCTOR LIST */}
                <div className="lg:col-span-2 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-[#f0f9ff] p-6 border-b border-blue-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Users className="text-blue-600" size={20} />
                      <h3 className="text-lg font-bold text-slate-900">Registered Doctors</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {doctors.length} doctor{doctors.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="p-0">
                    {doctors.length > 0 ? (
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#f8fbff] text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Doctor</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {doctors.map((doc) => (
                            <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-green-100 shrink-0 overflow-hidden">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=059669&color=fff`}
                                      alt="Avatar"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-sm font-bold text-slate-800">{doc.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-medium text-slate-500">{doc.email}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-500">
                                  {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2.5 py-1 bg-green-100 text-green-600 text-[10px] font-bold rounded-full">Verified</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => handleDeleteDoctor(doc.id, doc.name)}
                                    className="text-slate-400 hover:text-red-500 transition-colors"
                                    title="Delete doctor"
                                  >
                                    <Trash2 size={16} strokeWidth={1.5} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center">
                        <Stethoscope className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-sm font-semibold text-slate-400">No doctors registered yet</p>
                        <p className="text-xs text-slate-400 mt-1">Use the form to create a doctor account</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ---- SETTINGS TAB ---- */}
          {activeTab === 'Settings' && (
            <>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
                <p className="text-slate-500 text-sm">Manage your account and application preferences.</p>
              </div>

              <div className="flex flex-col xl:flex-row gap-8">
                {/* Settings Sidebar */}
                <div className="w-full xl:w-64 shrink-0">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col gap-1">
                    <button
                      onClick={() => setActiveSettingsTab('General')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeSettingsTab === 'General' ? 'bg-blue-50/50 text-blue-600 border border-blue-100/50 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                      <User size={18} className={activeSettingsTab === 'General' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} /> General
                    </button>
                    <button
                      onClick={() => setActiveSettingsTab('Notifications')}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeSettingsTab === 'Notifications' ? 'bg-blue-50/50 text-blue-600 border border-blue-100/50 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                    >
                      <Bell size={18} className={activeSettingsTab === 'Notifications' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'} /> Notifications
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                      <Lock size={18} className="text-slate-400 group-hover:text-slate-500" /> Security
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                      <Moon size={18} className="text-slate-400 group-hover:text-slate-500" /> Appearance
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                      <Globe size={18} className="text-slate-400 group-hover:text-slate-500" /> Language
                    </button>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8">

                  {/* General Settings */}
                  {activeSettingsTab === 'General' && (
                    <>
                      {/* Clinic Profile Section */}
                      <div className="mb-8">
                        <h3 className="text-base font-bold text-slate-800 mb-6">Clinic Profile</h3>

                        <div className="space-y-6">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Clinic Name</label>
                            <input type="text" defaultValue="Dental CarePlus Clinic" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-2">Email Address</label>
                              <input type="email" defaultValue="contact@dentalcareplus.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-2">Phone Number</label>
                              <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-2">Address</label>
                            <textarea rows="3" defaultValue="123 Medical Center Dr, Suite 200, San Francisco, CA 94105" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"></textarea>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-2">Timezone</label>
                              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]">
                                <option>Pacific Time (PT)</option>
                                <option>Eastern Time (ET)</option>
                                <option>Central Time (CT)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr className="border-slate-100 mb-8" />

                      {/* Business Hours Section */}
                      <div className="mb-10">
                        <h3 className="text-base font-bold text-slate-800 mb-6">Business Hours</h3>

                        <div className="space-y-4 max-w-md">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <div key={day} className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-slate-600 w-24">{day}</span>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <input type="text" defaultValue="09:00 am" className="w-28 pl-4 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white" />
                                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400">to</span>
                                <div className="relative">
                                  <input type="text" defaultValue="05:00 pm" className="w-28 pl-4 pr-8 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white" />
                                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notifications Settings */}
                  {activeSettingsTab === 'Notifications' && (
                    <>
                      <div className="mb-8">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Notification Preferences</h3>
                        <p className="text-slate-500 text-sm">Choose how you want to receive notifications and alerts.</p>
                      </div>

                      {/* Notification Channels */}
                      <div className="mb-8">
                        <h4 className="text-sm font-bold text-slate-800 mb-6">Notification Channels</h4>

                        <div className="space-y-6">
                          {/* Channel 1 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <Mail size={18} />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800">Email Notifications</h5>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Receive notifications via email</p>
                              </div>
                            </div>
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Channel 2 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                                <Smartphone size={18} />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800">SMS Notifications</h5>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Receive text message alerts</p>
                              </div>
                            </div>
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Channel 3 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                <Bell size={18} />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800">Push Notifications</h5>
                                <p className="text-[11px] font-medium text-slate-500 mt-0.5">Browser push notifications</p>
                              </div>
                            </div>
                            {/* Toggle Switch */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <hr className="border-slate-100 mb-8" />

                      {/* Notification Types */}
                      <div className="mb-10">
                        <h4 className="text-sm font-bold text-slate-800 mb-6">Notification Types</h4>

                        <div className="space-y-6">
                          {/* Type 1 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">Appointment Reminders</h5>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Get notified about upcoming appointments</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Type 2 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">New Patient Alerts</h5>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Notify when new patients register</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Type 3 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">Cancellation Alerts</h5>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Notify when appointments are cancelled</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Type 4 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">Weekly Reports</h5>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Receive weekly performance summaries</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          {/* Type 5 */}
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-sm font-bold text-slate-800">System Updates</h5>
                              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Important system and security updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <hr className="border-slate-100 mb-6" />

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3 mt-8">
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                      Cancel
                    </button>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#2563eb] hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-[0_4px_10px_-2px_rgba(37,99,235,0.3)]">
                      <Save size={16} strokeWidth={2.5} /> Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>

    </div>
  );
};

export default AdminDashboard;
