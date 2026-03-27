import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { X, Calendar as CalendarIcon, Clock, ChevronDown } from 'lucide-react-native';
import api from '../services/api';

const BookingScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    service_id: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '09:00', // Default time
    notes: '',
  });

  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  // Custom dropdown states
  const [serviceOpen, setServiceOpen] = useState(false);
  const [dentistOpen, setDentistOpen] = useState(false);
  const selectedService = services.find(s => String(s.id) === String(formData.service_id));
  const selectedDentist = dentists.find(d => String(d.id) === String(formData.dentist_id));

  useEffect(() => {
    fetchInitialData();
    
    // Pre-fill if rescheduling
    const rescheduleApt = navigation.getState().routes.find(r => r.name === 'Booking')?.params?.rescheduleApt;
    if (rescheduleApt) {
      // Format date from YYYY-MM-DD to DD/MM/YYYY
      const [year, month, day] = rescheduleApt.appointment_date.split('-');
      setFormData({
        service_id: rescheduleApt.service_id,
        dentist_id: rescheduleApt.dentist_id,
        appointment_date: `${day}/${month}/${year}`,
        appointment_time: rescheduleApt.appointment_time.substring(0, 5),
        notes: rescheduleApt.notes || '',
      });
    }
  }, []);

  const fetchInitialData = async () => {
    setFetchingData(true);
    try {
      const [servicesRes, dentistsRes] = await Promise.all([
        api.get('/services'),
        api.get('/auth/doctors')
      ]);
      setServices(servicesRes.data);
      setDentists(dentistsRes.data);
    } catch (err) {
      console.error('Failed to fetch booking data:', err.message);
      Alert.alert('Error', 'Failed to load services or dentists. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const handleBooking = async () => {
    if (!formData.service_id || !formData.dentist_id || !formData.appointment_date) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    // Basic date format validation (dd/mm/yyyy)
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(formData.appointment_date)) {
      Alert.alert('Error', 'Please enter date in DD/MM/YYYY format.');
      return;
    }

    setLoading(true);
    try {
      // Convert DD/MM/YYYY to YYYY-MM-DD for backend
      const [day, month, year] = formData.appointment_date.split('/');
      const formattedDate = `${year}-${month}-${day}`;
      
      const rescheduleApt = navigation.getState().routes.find(r => r.name === 'Booking')?.params?.rescheduleApt;

      if (rescheduleApt) {
        // Update existing
        await api.put(`/appointments/${rescheduleApt.id}`, {
          ...formData,
          appointment_date: formattedDate,
        });
        Alert.alert('Success', 'Appointment rescheduled successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
      } else {
        // Create new
        await api.post('/appointments', {
          ...formData,
          appointment_date: formattedDate,
        });
        Alert.alert('Success', 'Appointment booked successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process appointment.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e40af" />
        <Text style={styles.loadingText}>Loading booking options...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>

          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Book Appointment</Text>
              <Text style={styles.headerSubtitle}>Schedule your next dental visit</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>SELECT SERVICE</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, serviceOpen && styles.dropdownButtonActive]}
                  onPress={() => {
                    setServiceOpen(!serviceOpen);
                    setDentistOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, !selectedService && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {selectedService ? selectedService.name : 'Choose...'}
                  </Text>
                  <ChevronDown size={16} color="#475569" />
                </TouchableOpacity>
                {serviceOpen && (
                  <View style={styles.dropdownMenu}>
                    {services.map(s => (
                      <TouchableOpacity 
                        key={s.id} 
                        style={styles.dropdownMenuItem} 
                        onPress={() => { 
                          setFormData({ ...formData, service_id: s.id }); 
                          setServiceOpen(false); 
                        }}
                      >
                        <Text style={styles.dropdownMenuItemText}>{s.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={[styles.halfWidth, { zIndex: 10 }]}>
                <Text style={styles.label}>SELECT DENTIST</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, dentistOpen && styles.dropdownButtonActive]}
                  onPress={() => {
                    setDentistOpen(!dentistOpen);
                    setServiceOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, !selectedDentist && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {selectedDentist ? selectedDentist.name : 'Choose...'}
                  </Text>
                  <ChevronDown size={16} color="#475569" />
                </TouchableOpacity>
                {dentistOpen && (
                  <View style={styles.dropdownMenu}>
                    {dentists.map(d => (
                      <TouchableOpacity 
                        key={d.id} 
                        style={styles.dropdownMenuItem} 
                        onPress={() => { 
                          setFormData({ ...formData, dentist_id: d.id }); 
                          setDentistOpen(false); 
                        }}
                      >
                        <Text style={styles.dropdownMenuItemText}>{d.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>PREFERRED DATE</Text>
                <View style={styles.inputIconWrapper}>
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#64748b"
                    value={formData.appointment_date}
                    onChangeText={(val) => setFormData({ ...formData, appointment_date: val })}
                  />
                  <CalendarIcon size={18} color="#0f172a" style={styles.rightIcon} />
                </View>
              </View>
              
              <View style={styles.halfWidth}>
                <Text style={styles.label}>PREFERRED TIME</Text>
                <View style={styles.inputIconWrapper}>
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="HH:MM"
                    placeholderTextColor="#64748b"
                    value={formData.appointment_time}
                    onChangeText={(val) => setFormData({ ...formData, appointment_time: val })}
                  />
                  <Clock size={18} color="#0f172a" style={styles.rightIcon} />
                </View>
              </View>
            </View>

            <View style={styles.fullWidth}>
              <Text style={styles.label}>NOTES (OPTIONAL)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about any specific concerns..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                value={formData.notes}
                onChangeText={(val) => setFormData({ ...formData, notes: val })}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleBooking}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Appointment</Text>
              )}
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    flex: 1,
    maxHeight: 650,
  },
  header: {
    backgroundColor: '#1e40af',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#bfdbfe',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    zIndex: 10,
  },
  halfWidth: {
    width: '48%',
  },
  fullWidth: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#334155',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dropdownButton: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonActive: {
    borderColor: '#1e40af',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
  },
  dropdownMenuItem: {
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownMenuItemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  inputIconWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputWithIcon: {
    flex: 1,
    padding: 16,
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  rightIcon: {
    marginLeft: 8,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    fontWeight: '600',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
});

export default BookingScreen;

