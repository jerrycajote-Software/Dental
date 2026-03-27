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
import profilePic from '../assets/profile.png';

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
        return <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-emerald-100 text-emerald-600">Confirmed</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-bold leading-none text-blue-600 bg-blue-100 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 text-xs font-bold leading-none text-red-500 bg-red-100 rounded-full">Cancelled</span>;
      default:
        return <span className="px-3 py-1 text-xs font-bold leading-none rounded-full bg-amber-100 text-amber-600">Pending</span>;
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
          <div className="flex items-center h-16 px-6 border-b border-slate-200">
            <h1 className="text-xl font-bold tracking-tight">
              Dental <span className="text-blue-500">CarePlus</span>
            </h1>
          </div>

          {/* Nav Links */}
          <nav className="p-4 mt-4 space-y-2">
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
                src={profilePic}
                alt="Admin Profile"
                className="object-cover w-10 h-10 border rounded-full border-slate-200"
              />
              <div>
                {/* <p className="text-sm font-semibold text-slate-800">{user?.name || 'Admin'}</p> */}
                <p className="text-xs text-slate-500">Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 transition-colors rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-[#f8fbff] flex items-center justify-between px-8 border-b border-slate-200 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search patients, appointments..."
                className="py-2 pl-10 pr-4 text-sm transition-all bg-white border rounded-full w-72 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 placeholder:text-slate-400"
              />
            </div>

            <button className="relative p-2 mr-2 transition-colors rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <img
                src={profilePic}
                alt="Admin Profile"
                className="object-cover w-8 h-8 border rounded-full border-slate-200"
              />
              <div className="hidden lg:block">
                <p className="text-xs font-bold leading-none text-slate-800">{user?.name || 'Admin'}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-0.5">Administrator</p>
              </div>
            </div> */}
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* ---- OVERVIEW TAB ---- */}
          {activeTab === 'Overview' && (
            <>
              {/* Welcome Message */}
              <div className="mb-8">
                <h1 className="mb-1 text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                {/* <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Admin'}.</p> */}
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <p className="my-auto text-xs font-semibold text-slate-500">Total Appointments</p>
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-blue-500 shadow-sm rounded-xl">
                      <Calendar size={20} />
                    </div>
                  </div>
                  <h3 className="mb-2 text-3xl font-bold text-slate-800">{appointments.length}</h3>
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    Total in database
                  </p>
                </div>

                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <p className="my-auto text-xs font-semibold text-slate-500">New Patients</p>
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-purple-500 shadow-sm rounded-xl">
                      <Users size={20} />
                    </div>
                  </div>
                  <h3 className="mb-2 text-3xl font-bold text-slate-800">{[...new Set(appointments.map(a => a.client_id))].length}</h3>
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    Unique patients
                  </p>
                </div>


                <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <p className="my-auto text-xs font-semibold text-slate-500">Cancelled</p>
                    <div className="flex items-center justify-center w-10 h-10 text-white bg-red-500 shadow-sm rounded-xl">
                      <Activity size={20} />
                    </div>
                  </div>
                  <h3 className="mb-2 text-3xl font-bold text-slate-800">{appointments.filter(a => a.status === 'cancelled').length}</h3>
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    Total cancelled
                  </p>
                </div>
              </div>

              {/* LOWER SECTION: CHART & ACTIVITY */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

              {/* Appointments Overview Chart (Takes full width) */}
                <div className="lg:col-span-3 bg-white rounded-[1.25rem] p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Appointments Overview</h3>
                    <select className="text-xs font-semibold bg-transparent border-none outline-none cursor-pointer text-slate-500 hover:text-slate-700">
                      <option>This Week</option>
                      <option>Last Week</option>
                      <option>This Month</option>
                    </select>
                  </div>

                  <div className="w-full h-64">
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
              </div>
            </>
          )}

          {/* ---- APPOINTMENTS TAB ---- */}
          {activeTab === 'Appointments' && (
            <>
              {/* Header */}
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-slate-900">Appointments</h1>
                  <p className="text-sm text-slate-500">Manage patient bookings and schedules.</p>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="flex items-center justify-between p-2 mb-6 bg-white border shadow-sm rounded-xl border-slate-100">
                <div className="flex items-center flex-1 pl-3">
                  <Search size={18} className="mr-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by patient or doctor..."
                    className="w-full text-sm font-medium outline-none placeholder:text-slate-400 text-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="pl-4 pr-2 border-l border-slate-100">
                  <select
                    className="text-sm font-semibold bg-transparent outline-none cursor-pointer text-slate-600"
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
              <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-100">
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
                          <tr key={apt.id} className="transition-colors hover:bg-slate-50">
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
                                  className="transition-colors hover:text-emerald-500"
                                >
                                  <CheckCircle2 size={18} />
                                </button>
                                <button
                                  onClick={() => handleStatusChange(apt.id, 'cancelled')}
                                  title="Reject"
                                  className="transition-colors hover:text-red-500"
                                >
                                  <XCircle size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(apt.id)}
                                  title="Delete"
                                  className="ml-1 transition-colors hover:text-slate-600"
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
                        <td colSpan="6" className="px-6 py-8 text-sm font-medium text-center text-slate-400">
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
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-slate-900">Patients</h1>
                  <p className="text-sm text-slate-500">Manage patient records and history.</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="p-2 mb-6 bg-white border shadow-sm rounded-xl border-slate-100">
                <div className="flex items-center w-full pl-3">
                  <Search size={18} className="mr-2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search patients by name or email..."
                    className="w-full py-1 text-sm font-medium outline-none placeholder:text-slate-400 text-slate-700"
                  />
                </div>
              </div>

              {/* Patients Table */}
              <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-100 text-slate-800">
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
                                  className="object-cover w-full h-full"
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
                                  className="p-2 transition-colors rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"
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
                        <td colSpan="5" className="px-6 py-12 italic font-medium text-center text-slate-400">
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
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h1 className="mb-1 text-2xl font-bold text-slate-900">Manage Doctors</h1>
                  <p className="text-sm text-slate-500">Create and manage doctor accounts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                {/* CREATE DOCTOR FORM */}
                <div className="lg:col-span-1 bg-white rounded-[1.25rem] shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-[#f0fdf4] p-6 border-b border-green-50/50">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="text-green-600" size={20} />
                      <h3 className="text-lg font-bold text-slate-900">Add New Doctor</h3>
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">Create a doctor account with verified email</p>
                  </div>

                  <form onSubmit={handleCreateDoctor} className="p-6 space-y-4">
                    {doctorError && (
                      <div className="px-4 py-3 text-xs font-bold text-red-600 border border-red-200 bg-red-50 rounded-xl">
                        {doctorError}
                      </div>
                    )}
                    {doctorSuccess && (
                      <div className="px-4 py-3 text-xs font-bold text-green-600 border border-green-200 bg-green-50 rounded-xl">
                        {doctorSuccess}
                      </div>
                    )}

                    <div>
                      <label className="block mb-2 text-xs font-semibold text-slate-600">Full Name</label>
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
                      <label className="block mb-2 text-xs font-semibold text-slate-600">Email Address</label>
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
                      <label className="block mb-2 text-xs font-semibold text-slate-600">Password</label>
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
                      className="flex items-center justify-center w-full gap-2 px-4 py-3 mt-2 text-sm font-bold text-white transition-colors bg-green-600 shadow-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl"
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
                    <span className="px-3 py-1 text-xs font-bold rounded-full text-slate-500 bg-slate-100">
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
                            <tr key={doc.id} className="transition-colors hover:bg-slate-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="overflow-hidden bg-green-100 rounded-full w-9 h-9 shrink-0">
                                    <img
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=059669&color=fff`}
                                      alt="Avatar"
                                      className="object-cover w-full h-full"
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
                                    className="transition-colors text-slate-400 hover:text-red-500"
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
                        <Stethoscope className="mx-auto mb-3 text-slate-300" size={40} />
                        <p className="text-sm font-semibold text-slate-400">No doctors registered yet</p>
                        <p className="mt-1 text-xs text-slate-400">Use the form to create a doctor account</p>
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
                <h1 className="mb-1 text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-sm text-slate-500">Manage your account and application preferences.</p>
              </div>

              <div className="flex flex-col gap-8 xl:flex-row">
                {/* Settings Sidebar */}
                <div className="w-full xl:w-64 shrink-0">
                  <div className="flex flex-col gap-1 p-2 bg-white border shadow-sm rounded-2xl border-slate-100">
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
                    <button className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800">
                      <Lock size={18} className="text-slate-400 group-hover:text-slate-500" /> Security
                    </button>
                    <button className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-800">
                      <Globe size={18} className="text-slate-400 group-hover:text-slate-500" /> Language
                    </button>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1 p-8 bg-white border shadow-sm rounded-2xl border-slate-100">

                  {/* General Settings */}
                  {activeSettingsTab === 'General' && (
                    <>
                      {/* Clinic Profile Section */}
                      <div className="mb-8">
                        <h3 className="mb-6 text-base font-bold text-slate-800">Clinic Profile</h3>

                        <div className="space-y-6">
                          <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-600">Clinic Name</label>
                            <input type="text" defaultValue="Dental CarePlus Clinic" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <label className="block mb-2 text-xs font-semibold text-slate-600">Email Address</label>
                              <input type="email" defaultValue="contact@dentalcareplus.com" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                            </div>
                            <div>
                              <label className="block mb-2 text-xs font-semibold text-slate-600">Phone Number</label>
                              <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors" />
                            </div>
                          </div>

                          <div>
                            <label className="block mb-2 text-xs font-semibold text-slate-600">Address</label>
                            <textarea rows="3" defaultValue="123 Medical Center Dr, Suite 200, San Francisco, CA 94105" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"></textarea>
                          </div>

                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                              <label className="block mb-2 text-xs font-semibold text-slate-600">Timezone</label>
                              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-white appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22currentColor%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center]">
                                <option>Pacific Time (PT)</option>
                                <option>Eastern Time (ET)</option>
                                <option>Central Time (CT)</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr className="mb-8 border-slate-100" />

                      {/* Business Hours Section */}
                      <div className="mb-10">
                        <h3 className="mb-6 text-base font-bold text-slate-800">Business Hours</h3>

                        <div className="max-w-md space-y-4">
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <div key={day} className="flex items-center justify-between">
                              <span className="w-24 text-sm font-semibold text-slate-600">{day}</span>
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <input type="text" defaultValue="09:00 am" className="py-2 pl-4 pr-8 text-xs font-semibold bg-white border w-28 rounded-xl border-slate-200 text-slate-800" />
                                  <Clock size={14} className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-800" />
                                </div>
                                <span className="text-xs font-semibold text-slate-400">to</span>
                                <div className="relative">
                                  <input type="text" defaultValue="05:00 pm" className="py-2 pl-4 pr-8 text-xs font-semibold bg-white border w-28 rounded-xl border-slate-200 text-slate-800" />
                                  <Clock size={14} className="absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 text-slate-800" />
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
                        <h3 className="mb-1 text-lg font-bold text-slate-900">Notification Preferences</h3>
                        <p className="text-sm text-slate-500">Choose how you want to receive notifications and alerts.</p>
                      </div>

                      {/* Notification Channels */}
                      <div className="mb-8">
                        <h4 className="mb-6 text-sm font-bold text-slate-800">Notification Channels</h4>

                        <div className="space-y-6">
                          {/* Channel 1 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-10 h-10 text-blue-500 rounded-full bg-blue-50 shrink-0">
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
                              <div className="flex items-center justify-center w-10 h-10 text-green-500 rounded-full bg-green-50 shrink-0">
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
                              <div className="flex items-center justify-center w-10 h-10 text-purple-500 rounded-full bg-purple-50 shrink-0">
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

                      <hr className="mb-8 border-slate-100" />

                      {/* Notification Types */}
                      <div className="mb-10">
                        <h4 className="mb-6 text-sm font-bold text-slate-800">Notification Types</h4>

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

                  <hr className="mb-6 border-slate-100" />

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
