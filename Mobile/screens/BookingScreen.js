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
  FlatList
} from 'react-native';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react-native';
import api from '../services/api';

const BookingScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    service_id: '',
    dentist_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: '',
  });

  const [services, setServices] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);

  // Custom dropdown states
  const [serviceOpen, setServiceOpen] = useState(false);
  const [dentistOpen, setDentistOpen] = useState(false);
  const selectedService = services.find(s => s.id === formData.service_id);
  const selectedDentist = dentists.find(d => d.id === formData.dentist_id);

  useEffect(() => {
    // Mock data based on the screenshot, normally this would be an API call
    setServices([
      { id: '1', name: 'Cleaning' },
      { id: '2', name: 'Checkup' },
      { id: '3', name: 'Extraction' },
    ]);

    setDentists([
      { id: '1', name: 'Dr. Smith' },
      { id: '2', name: 'Dr. alvin' },
    ]);
  }, []);

  const handleBooking = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>

          {/* HEADER (Gradient-like representation) */}
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
                  style={styles.dropdownButton}
                  onPress={() => setServiceOpen(!serviceOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, !selectedService && styles.dropdownPlaceholder]}>
                    {selectedService ? selectedService.name : 'Choose a service...'}
                  </Text>
                </TouchableOpacity>
                {/* Simulated service dropdown */}
                {serviceOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={styles.dropdownMenuItem} onPress={() => { setFormData({ ...formData, service_id: '' }); setServiceOpen(false); }}>
                      <Text style={styles.dropdownMenuItemTextActive}>Choose a service...</Text>
                    </TouchableOpacity>
                    {services.map(s => (
                      <TouchableOpacity key={s.id} style={styles.dropdownMenuItem} onPress={() => { setFormData({ ...formData, service_id: s.id }); setServiceOpen(false); }}>
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
                  onPress={() => setDentistOpen(!dentistOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dropdownText, !selectedDentist && styles.dropdownPlaceholder]}>
                    {selectedDentist ? selectedDentist.name : 'Choose a dentist...'}
                  </Text>
                </TouchableOpacity>
                {/* Simulated dentist dropdown matching the mockup */}
                {dentistOpen && (
                  <View style={styles.dropdownMenu}>
                    <TouchableOpacity style={[styles.dropdownMenuItem, styles.dropdownMenuItemActive]} onPress={() => { setFormData({ ...formData, dentist_id: '' }); setDentistOpen(false); }}>
                      <Text style={styles.dropdownMenuItemTextActive}>Choose a dentist...</Text>
                    </TouchableOpacity>
                    {dentists.map(d => (
                      <TouchableOpacity key={d.id} style={styles.dropdownMenuItem} onPress={() => { setFormData({ ...formData, dentist_id: d.id }); setDentistOpen(false); }}>
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
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#64748b"
                    value={formData.appointment_date}
                    onChangeText={(val) => setFormData({ ...formData, appointment_date: val })}
                  />
                  <CalendarIcon size={18} color="#0f172a" style={styles.rightIcon} />
                </View>
              </View>
              {/* Optional: Add time if required, mockup cuts off here */}
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
    backgroundColor: '#9ca3af', // Match modal overlay background color
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)', // Dimmed background
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
    backgroundColor: '#1e40af', // Base blue representation. RN doesn't do smooth arbitrary gradients without expo-linear-gradient, so we use a solid that looks close
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
    borderColor: 'transparent',
  },
  dropdownButtonActive: {
    borderColor: '#000000',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  dropdownPlaceholder: {
    color: '#0f172a',
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
  },
  dropdownMenuItem: {
    padding: 12,
    paddingHorizontal: 16,
  },
  dropdownMenuItemActive: {
    backgroundColor: '#2563eb', // Blue selection color
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: '#334155',
  },
  dropdownMenuItemTextActive: {
    fontSize: 14,
    color: '#ffffff',
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
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
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

