import React, { useState, useEffect } from 'react';
import api from '../services/api';
import appointmentService from '../services/appointmentService';
import { X } from 'lucide-react';

const AppointmentForm = ({ onClose, onSuccess }) => {
  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [formData, setFormData] = useState({
    service_id: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, dentistsRes] = await Promise.all([
          api.get('/services'),
          api.get('/services/dentists')
        ]);
        setServices(servicesRes.data);
        setDentists(dentistsRes.data);
      } catch (err) {
        console.error('Failed to fetch services/dentists', err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await appointmentService.createAppointment(formData);
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
            <h3 className="text-2xl font-black">Book Appointment</h3>
            <p className="text-blue-100 text-sm font-bold opacity-80 mt-1">Schedule your next dental visit</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-2xl transition-all duration-300"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 animate-shake">
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

          <div className="grid grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Preferred Time</label>
              <input
                type="time"
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-black text-slate-700 ml-1 uppercase tracking-widest">Notes (Optional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#a1c4fd] transition-all h-28 resize-none"
              placeholder="Tell us about any specific concerns..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 rounded-2xl text-white font-black text-lg transition-all duration-300 shadow-xl transform active:scale-[0.98] ${loading
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
            ) : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
