import React, { useState, useEffect } from 'react';
import api from '../services/api';
import appointmentService from '../services/appointmentService';
import { X, Clock } from 'lucide-react';

// Fixed 1-hour slots: 9 AM through 5 PM (last slot runs 5–6 PM)
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

const AppointmentForm = ({ onClose, onSuccess, appointment = null }) => {
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // array of "HH:MM" strings
  const [formData, setFormData] = useState({
    service_id: appointment?.service_id || '',
    dentist_id: appointment?.dentist_id || '',
    appointment_date: appointment?.appointment_date
      ? new Date(appointment.appointment_date).toISOString().split('T')[0]
      : '',
    appointment_time: appointment?.appointment_time?.slice(0, 5) || '',
    notes: appointment?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch services once on mount
  useEffect(() => {
    api.get('/services').then(res => setServices(res.data)).catch(console.error);
  }, []);

  // Re-fetch available dentists whenever date changes
  useEffect(() => {
    if (!formData.appointment_date) return;
    const fetch = async () => {
      try {
        const res = await api.get(`/services/dentists?date=${formData.appointment_date}`);
        setDentists(res.data);
        // Reset dentist if no longer available
        if (formData.dentist_id && !res.data.find(d => d.id === Number(formData.dentist_id))) {
          setFormData(prev => ({ ...prev, dentist_id: '', appointment_time: '' }));
        }
      } catch (err) {
        console.error('Failed to fetch dentists', err);
      }
    };
    fetch();
  }, [formData.appointment_date]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch booked slots whenever doctor or date changes
  useEffect(() => {
    if (!formData.dentist_id || !formData.appointment_date) {
      setBookedSlots([]);
      return;
    }
    const fetch = async () => {
      try {
        const res = await api.get(
          `/appointments/booked-slots?dentist_id=${formData.dentist_id}&date=${formData.appointment_date}`
        );
        setBookedSlots(res.data);
        // Clear selected slot if it's now booked (e.g. rescheduling)
        if (formData.appointment_time && res.data.includes(formData.appointment_time)) {
          const isSelf = appointment &&
            appointment.appointment_time?.slice(0, 5) === formData.appointment_time &&
            String(appointment.dentist_id) === String(formData.dentist_id) &&
            new Date(appointment.appointment_date).toISOString().split('T')[0] === formData.appointment_date;
          if (!isSelf) setFormData(prev => ({ ...prev, appointment_time: '' }));
        }
      } catch (err) {
        console.error('Failed to fetch booked slots', err);
      }
    };
    fetch();
  }, [formData.dentist_id, formData.appointment_date]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSlotSelect = (value) => {
    setFormData(prev => ({ ...prev, appointment_time: value }));
  };

  const isSlotBooked = (slotValue) => {
    // When rescheduling, the original slot of this appointment isn't "booked" for the user
    if (
      appointment &&
      appointment.appointment_time?.slice(0, 5) === slotValue &&
      String(appointment.dentist_id) === String(formData.dentist_id) &&
      new Date(appointment.appointment_date).toISOString().split('T')[0] === formData.appointment_date
    ) {
      return false;
    }
    return bookedSlots.includes(slotValue);
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
      if (appointment) {
        await appointmentService.updateAppointment(appointment.id, formData);
      } else {
        await appointmentService.createAppointment(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300 font-sans">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-blue-50 animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-[#1a237e] to-[#42a5f5] p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">{appointment ? 'Reschedule Appointment' : 'Book Appointment'}</h3>
            <p className="text-blue-100 text-sm font-bold opacity-80 mt-1">
              {appointment ? 'Update your visit details' : 'Schedule your next dental visit'}
            </p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-2xl transition-all duration-300">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Select Service</label>
              <select
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Choose a service...</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.name} - ₱{s.price}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Select Dentist</label>
              <select
                name="dentist_id"
                value={formData.dentist_id}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all appearance-none cursor-pointer"
                required
              >
                <option value="">Choose a dentist...</option>
                {dentists.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Preferred Date</label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all"
              required
            />
          </div>

          {/* Time Slot Picker */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-slate-400" />
              Select Time Slot
              <span className="text-xs font-medium text-slate-400 normal-case tracking-normal">(1-hour sessions)</span>
            </label>
            {!formData.dentist_id || !formData.appointment_date ? (
              <p className="text-xs text-slate-400 italic px-1">Select a dentist and date to see available slots.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {ALL_SLOTS.map(slot => {
                  const booked = isSlotBooked(slot.value);
                  const selected = formData.appointment_time === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      disabled={booked}
                      onClick={() => handleSlotSelect(slot.value)}
                      className={`py-3 rounded-2xl text-sm font-bold transition-all duration-200 border-2 ${
                        booked
                          ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed line-through'
                          : selected
                          ? 'bg-[#1a237e] text-white border-[#1a237e] shadow-lg shadow-blue-900/20 scale-[1.03]'
                          : 'bg-slate-50 text-slate-700 border-slate-100 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {booked ? '✕' : ''}{slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all h-24 resize-none"
              placeholder="Tell us about any specific concerns..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.appointment_time}
            className={`w-full py-5 rounded-2xl text-white font-black text-lg transition-all duration-300 shadow-xl transform active:scale-[0.98] ${
              loading || !formData.appointment_time
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-[#1a237e] hover:bg-[#1a237e]/90 shadow-blue-900/20'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (appointment ? 'Update Appointment' : 'Confirm Appointment')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
