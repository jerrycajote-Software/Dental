import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Clock, User, AlertTriangle, CheckSquare } from 'lucide-react';

const WalkinAppointmentForm = ({ onClose, onSuccess, currentDentistId }) => {
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);

  // Get today's date string in local time (YYYY-MM-DD)
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const todayStr = getTodayStr();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    age: '',
    date_of_birth: '',
    contact_number: '',
    home_address: '',
    allergies: '',
    previous_dental_history: '',
    blood_type: '',
    civil_status: '',
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
    api.get('/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  // Fetch dentists when date changes
  useEffect(() => {
    if (!formData.appointment_date) return;
    api
      .get(`/services/dentists?date=${formData.appointment_date}`)
      .then(res => setDentists(res.data))
      .catch(err => console.error('Failed to fetch dentists', err));
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
    const interval = setInterval(fetchBookedSlots, 30000);
    return () => clearInterval(interval);
  }, [formData.dentist_id, formData.appointment_date]);

  // Calculate age from date of birth
  const calculateAge = (dobStr) => {
    if (!dobStr) return '';
    const birth = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 0 ? String(age) : '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date_of_birth') {
      setFormData(prev => ({ ...prev, date_of_birth: value, age: calculateAge(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const ids = prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId];
      return { ...prev, service_ids: ids };
    });
  };

  // Get minimum time for today's appointments (current time)
  const getMinTime = () => {
    if (formData.appointment_date === todayStr) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    return undefined;
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

    // Past date/time validation (client-side guard)
    const apptDateTime = new Date(`${formData.appointment_date}T${formData.appointment_time}`);
    if (apptDateTime < new Date()) {
      setError('Cannot book an appointment in the past. Please select a future date and time.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/appointments/walkin', formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book walk-in appointment');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] focus:outline-none transition-all';
  const labelClass = 'text-xs font-bold text-slate-700 uppercase';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#1089d3] p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <User size={24} />
              Walk-in Patient Registration &amp; Booking
            </h3>
            <p className="text-blue-100 text-sm font-medium mt-1">
              Create a new patient account and schedule their appointment.
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all duration-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 flex items-center gap-2">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {/* ── PATIENT INFORMATION ── */}
          <section>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
              Patient Information
            </h4>

            {/* Name row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>First Name *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Last Name *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Middle Name</label>
                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Email & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className={labelClass}>Email Address (Gmail) *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@gmail.com" className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Contact Number</label>
                <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* DOB → Age (auto) → Civil Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-1">
                <label className={labelClass}>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  max={todayStr}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>
                  Age{' '}
                  <span className="text-slate-400 normal-case font-normal">(auto-filled)</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  readOnly
                  placeholder="Auto-calculated"
                  className={`${inputClass} bg-slate-100 cursor-default text-slate-500`}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Civil Status</label>
                <select name="civil_status" value={formData.civil_status} onChange={handleChange} className={inputClass}>
                  <option value="">Select status...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                  <option value="In a Relationship">In a Relationship</option>
                </select>
              </div>
            </div>

            {/* Blood Type & Home Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className={labelClass}>
                  Blood Type{' '}
                  <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <select name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputClass}>
                  <option value="">Select blood type...</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Home Address</label>
                <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Allergies & Dental History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className={labelClass}>Allergies</label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                  placeholder="Medication or food allergies..."
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Previous Dental History</label>
                <textarea
                  name="previous_dental_history"
                  value={formData.previous_dental_history}
                  onChange={handleChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                  placeholder="Major surgeries, current treatments..."
                />
              </div>
            </div>
          </section>

          {/* ── APPOINTMENT DETAILS ── */}
          <section>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
              Appointment Details
            </h4>

            {/* Multi-service selection */}
            <div className="space-y-2">
              <label className={`${labelClass} flex items-center gap-2`}>
                <CheckSquare size={14} className="text-[#1089d3]" />
                Services *
                <span className="text-slate-400 normal-case font-normal text-xs">(select one or more)</span>
              </label>
              {services.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Loading services...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {services.map(s => {
                    const isChecked = formData.service_ids.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleServiceToggle(s.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                          isChecked
                            ? 'border-[#1089d3] bg-blue-50 text-[#1089d3]'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                            isChecked ? 'bg-[#1089d3] border-[#1089d3]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">{s.name}</p>
                          <p className="text-xs text-slate-400">₱{s.price} · {s.duration_minutes} min</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {formData.service_ids.length > 0 && (
                <p className="text-xs text-[#1089d3] font-semibold pt-1">
                  ✓ {formData.service_ids.length} service{formData.service_ids.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Dentist & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-1">
                <label className={labelClass}>Assign Dentist *</label>
                <select
                  required
                  name="dentist_id"
                  value={formData.dentist_id}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Choose a dentist...</option>
                  {dentists.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Appointment Date *</label>
                <input
                  required
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  min={todayStr}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Booked slots info panel */}
            {formData.dentist_id && formData.appointment_date && (
              <div className="mt-5 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock size={12} className="text-rose-400" />
                  Already Booked on{' '}
                  {new Date(formData.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {bookedSlots.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    No bookings yet — all slots are available
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {bookedSlots.map((slot, i) => (
                      <span
                        key={i}
                        className="bg-rose-100 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1"
                      >
                        <Clock size={10} />
                        {formatTime12h((slot.time || '00:00').slice(0, 5))}
                      </span>
                    ))}
                  </div>
                )}
                {doctorSchedule && (
                  <p className="text-xs text-slate-400 mt-3 border-t border-slate-100 pt-2">
                    Doctor's working hours:{' '}
                    <span className="font-semibold text-slate-600">
                      {formatTime12h(doctorSchedule.start)} – {formatTime12h(doctorSchedule.end)}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Time input — doctor assigns manually */}
            <div className="mt-5 space-y-1">
              <label className={`${labelClass} flex items-center gap-2`}>
                <Clock size={14} className="text-[#1089d3]" />
                Appointment Time *
                <span className="text-slate-400 normal-case font-normal text-xs">(assigned by doctor)</span>
              </label>
              <input
                required
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                min={getMinTime()}
                onChange={handleChange}
                className={`${inputClass} md:w-48`}
              />
              {formData.appointment_time && (
                <p className="text-xs text-[#1089d3] font-semibold pt-1">
                  Selected: {formatTime12h(formData.appointment_time)} PHT
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="mt-6 space-y-1">
              <label className={labelClass}>Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className={`${inputClass} resize-none`}
                placeholder="Optional notes for the doctor..."
              />
            </div>
          </section>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.appointment_time || formData.service_ids.length === 0}
              className={`flex-[2] py-4 rounded-xl text-white font-black text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                loading || !formData.appointment_time || formData.service_ids.length === 0
                  ? 'bg-slate-300 cursor-not-allowed shadow-none'
                  : 'bg-[#1089d3] hover:bg-[#0d73b0] shadow-blue-500/30'
              }`}
            >
              {loading ? 'Processing...' : 'Register Patient & Book Slot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalkinAppointmentForm;
