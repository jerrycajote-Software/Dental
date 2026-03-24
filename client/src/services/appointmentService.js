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

const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};

export default { getAppointments, createAppointment, updateStatus, deleteAppointment };
