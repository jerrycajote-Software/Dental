import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  Calendar, Clock, FileText, ArrowLeft, AlertCircle
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const AppointmentHistoryScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [])
  );

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err.message);
      Alert.alert('Error', 'Failed to load appointment history.');
    } finally {
      setLoading(false);
    }
  };

  const isAppointmentExpired = (appointment) => {
    const now = new Date();
    const apptDate = new Date(appointment.appointment_date);
    const [hours, minutes] = appointment.appointment_time.split(':');
    apptDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return apptDate < now;
  };

  const pastAppointments = appointments; // Show all appointments

  const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const getBadgeStyle = (status) => {
    switch (status) {
      case 'confirmed': return { bg: '#d1fae5', text: '#059669', label: 'Confirmed' };
      case 'completed': return { bg: '#dbeafe', text: '#2563eb', label: 'Completed' };
      case 'cancelled': return { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' };
      case 'pending': return { bg: '#fef08a', text: '#ca8a04', label: 'Pending' };
      default: return { bg: '#ffedd5', text: '#ea580c', label: status };
    }
  };

  const renderBadge = (status) => {
    const style = getBadgeStyle(status);
    return (
      <View style={[styles.badgeContainer, { backgroundColor: style.bg }]}>
        <Text style={[styles.badgeText, { color: style.text }]}>{style.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <FileText size={24} color="#2563eb" />
          <Text style={styles.headerTitle}>Appointment History</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* HISTORY LIST */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>All Appointments</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{pastAppointments.length}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 40 }} />
            ) : pastAppointments.length > 0 ? (
              pastAppointments
                .slice()
                .sort((a, b) => {
                  const dateCompare = new Date(b.appointment_date) - new Date(a.appointment_date);
                  return dateCompare !== 0 ? dateCompare : b.appointment_time.localeCompare(a.appointment_time);
                })
                .map((apt, index) => (
                  <View key={apt.id} style={[styles.historyItem, index !== pastAppointments.length - 1 && styles.historyItemBorder]}>
                    <View style={styles.historyDateContainer}>
                      <Text style={styles.historyDay}>
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { day: 'numeric', timeZone: 'UTC' })}
                      </Text>
                      <Text style={styles.historyMonth}>
                        {new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}
                      </Text>
                    </View>

                    <View style={styles.historyDetails}>
                      <View style={styles.historyTopRow}>
                        <Text style={styles.historyService}>{apt.service_name}</Text>
                        {renderBadge(apt.status)}
                      </View>
                      <Text style={styles.historyDoctor}>Dr. {apt.dentist_name}</Text>
                      <View style={styles.historyTimeRow}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.historyTime}>{formatTime12h(apt.appointment_time)}</Text>
                      </View>
                    </View>
                  </View>
                ))
            ) : (
              <View style={styles.emptyState}>
                <AlertCircle size={48} color="#cbd5e1" />
                <Text style={styles.noDataTitle}>No appointment history</Text>
                <Text style={styles.noDataText}>Your past appointments will appear here.</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e7f0fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    backgroundColor: '#fafbfc',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 10,
  },
  cardBody: {
    padding: 20,
  },
  countBadge: {
    backgroundColor: '#ebf5ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#2563eb',
  },
  historyItem: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historyDateContainer: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    paddingVertical: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  historyDay: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563eb',
    lineHeight: 24,
  },
  historyMonth: {
    fontSize: 10,
    fontWeight: '700',
    color: '#60a5fa',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  historyDetails: {
    flex: 1,
  },
  historyTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyService: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    flex: 1,
    marginRight: 12,
  },
  historyDoctor: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 6,
  },
  historyTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyTime: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 16,
  },
  noDataText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default AppointmentHistoryScreen;
