import api from './api';

const getAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data;
};

const createAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

const updateStatus = async (id, status) => {
  const response = await api.patch(`/appointments/${id}/status`, { status });
  return response.data;
};

const updateAppointment = async (id, appointmentData) => {
  const response = await api.patch(`/appointments/${id}`, appointmentData);
  return response.data;
};

const cancelAppointment = async (id) => {
  return updateStatus(id, 'cancelled');
};

export default { getAppointments, createAppointment, updateStatus, updateAppointment, cancelAppointment };
