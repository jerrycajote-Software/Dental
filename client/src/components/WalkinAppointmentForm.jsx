import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Clock, User, Phone, MapPin, AlertTriangle, FileText } from 'lucide-react';

const ALL_SLOTS = [
  { label: '9:00 AM',  value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM',  value: '13:00' },
  { label: '2:00 PM',  value: '14:00' },
  { label: '3:00 PM',  value: '15:00' },
  { label: '4:00 PM',  value: '16:00' },
  { label: '5:00 PM',  value: '17:00' },
];

const SLOT_DURATION_MINS = 60;

const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const WalkinAppointmentForm = ({ onClose, onSuccess, currentDentistId }) => {
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctorSchedule, setDoctorSchedule] = useState(null);
  
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
    service_id: '',
    dentist_id: currentDentistId || '',
    appointment_date: new Date().toISOString().split('T')[0],
    appointment_time: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!formData.appointment_date) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/services/dentists?date=${formData.appointment_date}`);
        setDentists(res.data);
      } catch (err) {
        console.error('Failed to fetch dentists', err);
      }
    };
    fetch();
  }, [formData.appointment_date]);

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
        const finalBooked = Array.isArray(booked) ? booked : [];
        setDoctorSchedule(schedule || null);
        setBookedSlots(finalBooked);

        if (formData.appointment_time && finalBooked.length > 0) {
          const isBooked = finalBooked.some(b => {
            const slotStart = timeToMinutes(formData.appointment_time);
            const slotEnd = slotStart + SLOT_DURATION_MINS;
            const bookedStart = timeToMinutes(b?.time);
            const bookedEnd = bookedStart + (b?.duration || 60);
            return Math.max(slotStart, bookedStart) < Math.min(slotEnd, bookedEnd);
          });
          
          const isOutsideSchedule = schedule && (
            timeToMinutes(formData.appointment_time) < timeToMinutes(schedule.start) ||
            timeToMinutes(formData.appointment_time) + SLOT_DURATION_MINS > timeToMinutes(schedule.end)
          );

          if (isBooked || isOutsideSchedule) {
            setFormData(prev => ({ ...prev, appointment_time: '' }));
            setError(isBooked ? 'The selected time slot was just booked.' : 'The selected time is outside working hours.');
          }
        }
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
      }
    };

    fetchBookedSlots();
    const interval = setInterval(fetchBookedSlots, 30000);
    return () => clearInterval(interval);
  }, [formData.dentist_id, formData.appointment_date, formData.appointment_time]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSlotSelect = (value) => {
    setFormData(prev => ({ ...prev, appointment_time: value }));
  };

  const isSlotBooked = (slotValue) => {
    const slotStart = timeToMinutes(slotValue);
    const slotEnd = slotStart + SLOT_DURATION_MINS;

    if (doctorSchedule) {
      if (slotStart < timeToMinutes(doctorSchedule.start) || slotEnd > timeToMinutes(doctorSchedule.end)) {
        return true;
      }
    }

    return (bookedSlots || []).some(booked => {
      const bookedStart = timeToMinutes(booked?.time);
      const bookedEnd = bookedStart + (booked?.duration || 60);
      return Math.max(slotStart, bookedStart) < Math.min(slotEnd, bookedEnd);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.appointment_time) {
      setError('Please select a time slot.');
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="bg-[#1089d3] p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <User size={24} />
              Walk-in Patient Registration & Booking
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

          {/* PATIENT INFO SECTION */}
          <section>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Patient Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">First Name *</label>
                <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Last Name *</label>
                <input required type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Middle Name</label>
                <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Email Address (Gmail) *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} placeholder="patient@gmail.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Contact Number</label>
                <input type="tel" name="contact_number" value={formData.contact_number} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Date of Birth</label>
                <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Home Address</label>
              <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all resize-none" placeholder="Medication or food allergies..." />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Previous Dental History</label>
                <textarea name="previous_dental_history" value={formData.previous_dental_history} onChange={handleChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all resize-none" placeholder="Major surgeries, current treatments..." />
              </div>
            </div>
          </section>

          {/* APPOINTMENT SECTION */}
          <section>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Appointment Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Select Service *</label>
                <select required name="service_id" value={formData.service_id} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#1089d3] transition-all cursor-pointer">
                  <option value="">Choose a service...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - ₱{s.price}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Assign Dentist *</label>
                <select required name="dentist_id" value={formData.dentist_id} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#1089d3] transition-all cursor-pointer">
                  <option value="">Choose a dentist...</option>
                  {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Appointment Date *</label>
              <input required type="date" name="appointment_date" value={formData.appointment_date} min={new Date().toISOString().split('T')[0]} onChange={handleChange} className="w-full md:w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-bold focus:ring-2 focus:ring-[#1089d3] transition-all" />
            </div>

            {/* Time Slot Picker */}
            <div className="mt-6 space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Clock size={14} className="text-[#1089d3]" />
                Time Slot *
              </label>
              {!formData.dentist_id || !formData.appointment_date ? (
                <p className="text-xs text-slate-400 italic">Select a dentist and date to view available time slots.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {ALL_SLOTS.map(slot => {
                    const booked = isSlotBooked(slot.value);
                    const selected = formData.appointment_time === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        disabled={booked}
                        onClick={() => handleSlotSelect(slot.value)}
                        className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 border-2 ${
                          booked
                            ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            : selected
                            ? 'bg-[#1089d3] text-white border-[#1089d3] shadow-md shadow-blue-500/30 transform scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#1089d3] hover:text-[#1089d3]'
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Additional Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-[#1089d3] transition-all resize-none" placeholder="Optional notes for the doctor..." />
            </div>
          </section>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.appointment_time}
              className={`flex-[2] py-4 rounded-xl text-white font-black text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                loading || !formData.appointment_time
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
