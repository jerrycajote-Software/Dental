
../removed
import AppointmentForm from '../components/AppointmentForm';
  const [showForm, setShowForm] = useState(false);
 const [reschedulingAppointment, setReschedulingAppointment] = useState(null);


line 69
 const handleReschedule = (appointment) => {
    setReschedulingAppointment(appointment);
    setShowForm(true);
  };
this below
  // ... (getStatusBadge, getStatusColor, etc. remain same)


line 144
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

line 175
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

line 231
  <button
                              onClick={() => handleReschedule(apt)}
                              className="text-xs font-bold text-blue-500 transition-colors hover:text-blue-700"
                            >
                              Reschedule
                            </button>




Login Module

line 160
<span className="agreement" style={{ marginTop: '20px' }}>
              <Link to="/register">Don't have an account? Sign Up</Link>
            </span>


Navbar jsx Module

line 54
 <Link to="/login" className="text-sm font-black transition-colors text-slate-900 hover:text-white">
                  Sign In
                </Link>

Line 103
 className="w-full py-4 text-base font-black text-center transition-colors text-slate-800 hover:text-white"

line 107
 <Link
                  to="/register"
                  onClick={closeMenu}
                  className="w-full py-4 text-base font-black text-center text-white transition-all shadow-xl rounded-2xl bg-slate-900 hover:bg-slate-800"
                >
                  Get Started
                </Link>



App jsx
line 4
import Register from './pages/Register';

line 42
  const isFullScreenPage = ['/login', '/register', '/admin', '/doctor', '/forgot-password'].includes(location.pathname) 

line 52
 <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
