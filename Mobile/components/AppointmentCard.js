import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppointmentCard = ({ appointment }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{appointment?.service_name || 'Appointment'}</Text>
      <Text style={styles.details}>{appointment?.appointment_date} at {appointment?.appointment_time}</Text>
      <Text style={styles.status}>{appointment?.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
    color: '#3b82f6',
    textTransform: 'uppercase',
  },
});

export default AppointmentCard;
