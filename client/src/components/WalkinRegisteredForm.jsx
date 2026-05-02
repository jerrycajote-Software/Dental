import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Clock, User, AlertTriangle, CheckSquare, Search, ChevronRight } from 'lucide-react';

const WalkinRegisteredForm = ({ onClose, onSuccess, currentDentistId }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Form
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  const [fetchingServices, setFetchingServices] = useState(true);

  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();

  const [formData, setFormData] = useState({
    client_id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    age: '',
    date_of_birth: '',
    contact_number: '',
    home_address: '',
    allergies: '', // explicitly not pre-filled
    previous_dental_history: '', // explicitly not pre-filled
    blood_type: '',
    civil_status: '',
    gender: '',
    service_ids: [],
    dentist_id: currentDentistId ? String(currentDentistId) : '',
    appointment_date: todayStr,
    appointment_time: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch services on mount
  useEffect(() => {
    setFetchingServices(true);
    api.get('/services')
      .then(res => {
        setServices(res.data);
        setFetchingServices(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setError('Failed to load services.');
        setFetchingServices(false);
      });
  }, []);

  // Fetch dentists when date changes
  useEffect(() => {
    if (!formData.appointment_date) return;
    api
      .get(`/services/dentists?date=${formData.appointment_date}&include_all=true`)
      .then(res => setDentists(res.data))
      .catch(err => {
        console.error('Failed to fetch dentists', err);
      });
  }, [formData.appointment_date]);

  // Fetch booked slots when dentist or date changes
  useEffect(() => {
    if (!formData.dentist_id || !formData.appointment_date) {
      setBookedSlots([]);
      setDoctorSchedule(null);
      return;
    }

    const fetchBookedSlots = async () => {
      try {
        const res = await api.get(
          `/appointments/booked-slots?dentist_id=${formData.dentist_id}&date=${formData.appointment_date}`
        );
        const { booked, schedule } = res.data || {};
        setDoctorSchedule(schedule || null);
        setBookedSlots(Array.isArray(booked) ? booked : []);
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
      }
    };

    fetchBookedSlots();
  }, [formData.dentist_id, formData.appointment_date]);

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 2) {
      setPatients([]);
      return;
    }

    setSearching(true);
    try {
      const res = await api.get('/auth/patients');
      const filtered = res.data.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.email.toLowerCase().includes(query.toLowerCase())
      );
      setPatients(filtered);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearching(false);
    }
  };

  const selectPatient = async (patient) => {
    try {
      setLoading(true);
      const res = await api.get(`/auth/patients/${patient.id}`);
      const p = res.data;
      
      setFormData(prev => ({
        ...prev,
        client_id: p.id,
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        middle_name: p.middle_name || '',
        email: p.email || '',
        age: p.age || '',
        date_of_birth: p.date_of_birth ? p.date_of_birth.split('T')[0] : '',
        contact_number: p.contact_number || '',
        home_address: p.home_address || '',
        blood_type: p.blood_type || '',
        civil_status: p.civil_status || '',
        gender: p.gender || '',
        // Allergies and History are NOT pre-filled as per requirement
        allergies: '',
        previous_dental_history: '',
      }));
      
      setSelectedPatient(p);
      setStep(2);
    } catch (err) {
      setError('Failed to fetch patient details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const ids = prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId];
      return { ...prev, service_ids: ids };
    });
  };

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.service_ids.length === 0) {
      setError('Please select at least one service.');
      setLoading(false);
      return;
    }

    if (!formData.appointment_time) {
      setError('Please enter an appointment time.');
      setLoading(false);
      return;
    }

    try {
      // Use existing walk-in endpoint which handles existing accounts via email
      await api.post('/appointments/walkin', formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
      setLoading(false);
    }
  };

  const inputClass = 'w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] focus:outline-none transition-all';
  const labelClass = 'text-xs font-bold text-slate-700 uppercase';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#1089d3] p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <User size={24} />
              {step === 1 ? 'Search Registered Patient' : 'Book Appointment for Registered Patient'}
            </h3>
            <p className="text-blue-100 text-sm font-medium mt-1">
              {step === 1 ? 'Find an existing patient record in the system.' : `Booking for ${selectedPatient?.name}`}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 mb-6 flex items-center gap-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-[#1089d3] focus:outline-none font-bold text-slate-900 transition-all"
                />
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {searching ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1089d3] mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Searching patients...</p>
                  </div>
                ) : patients.length > 0 ? (
                  patients.map(p => (
                    <button
                      key={p.id}
                      onClick={() => selectPatient(p)}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#1089d3] hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#1089d3] font-bold">
                          {p.name[0]}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-slate-900 group-hover:text-[#1089d3]">{p.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{p.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-[#1089d3]" size={20} />
                    </button>
                  ))
                ) : searchQuery.length >= 2 ? (
                  <p className="text-center py-10 text-slate-500 font-medium">No patients found matching "{searchQuery}"</p>
                ) : (
                  <p className="text-center py-10 text-slate-500 font-medium italic">Type at least 2 characters to search.</p>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Pre-filled Info (Read-only or just visible) */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className={labelClass}>Patient Name</p>
                  <p className="font-bold text-slate-900 mt-1">{formData.first_name} {formData.middle_name} {formData.last_name}</p>
                </div>
                <div>
                  <p className={labelClass}>Email Address</p>
                  <p className="font-bold text-slate-900 mt-1">{formData.email}</p>
                </div>
                <div>
                  <p className={labelClass}>Contact Number</p>
                  <p className="font-bold text-slate-900 mt-1">{formData.contact_number || 'N/A'}</p>
                </div>
                <div>
                  <p className={labelClass}>Gender</p>
                  <p className="font-bold text-slate-900 mt-1">{formData.gender || 'N/A'}</p>
                </div>
              </div>

              {/* Editable Fields (New session details) */}
              <div className="space-y-6">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-[#1089d3] pl-3">Session Details</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Allergies</label>
                    <textarea
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="e.g. Penicillin, Latex (Leave blank if none)"
                      className={inputClass + ' h-24 resize-none'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Previous Dental History</label>
                    <textarea
                      name="previous_dental_history"
                      value={formData.previous_dental_history}
                      onChange={handleChange}
                      placeholder="e.g. Previous tooth extraction 2023"
                      className={inputClass + ' h-24 resize-none'}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className={labelClass}>Select Services</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {services.map(svc => (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => handleServiceToggle(svc.id)}
                        className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${
                          formData.service_ids.includes(svc.id)
                            ? 'bg-[#1089d3] border-[#1089d3] text-white'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        {svc.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Assign Dentist</label>
                    <select
                      name="dentist_id"
                      value={formData.dentist_id}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Dentist</option>
                      {dentists.map(d => (
                        <option key={d.id} value={d.id}>Dr. {d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Appointment Date</label>
                    <input
                      type="date"
                      name="appointment_date"
                      value={formData.appointment_date}
                      onChange={handleChange}
                      min={todayStr}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Appointment Time</label>
                    <input
                      type="time"
                      name="appointment_time"
                      value={formData.appointment_time}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Additional Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any specific requests or concerns..."
                    className={inputClass + ' h-24 resize-none'}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Back to Search
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-4 font-black text-white bg-[#1089d3] rounded-2xl hover:bg-[#0d73b0] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Complete Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkinRegisteredForm;
