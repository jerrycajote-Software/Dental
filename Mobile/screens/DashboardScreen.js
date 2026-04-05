import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  Image
} from 'react-native';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  Plus, MessageCircle, X
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api, { getUserInfo } from '../services/api';
import ChatBot from '../components/ChatBot';

const DashboardScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatBotVisible, setIsChatBotVisible] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.put(`/appointments/${id}/status`, { status: 'cancelled' });
              Alert.alert('Success', 'Appointment cancelled.');
              fetchAppointments();
            } catch (err) {
              Alert.alert('Error', 'Failed to cancel appointment.');
            }
          }
        }
      ]
    );
  };

  const activeAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');

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
      case 'confirmed': return { bg: '#d1fae5', text: '#059669', label: 'Confirmed' }; // emerald
      case 'completed': return { bg: '#d1fae5', text: '#059669', label: 'Completed' };
      case 'cancelled': return { bg: '#fee2e2', text: '#dc2626', label: 'Cancelled' }; // red
      case 'pending': return { bg: '#fef08a', text: '#ca8a04', label: 'Pending' }; // yellow
      default: return { bg: '#ffedd5', text: '#ea580c', label: status }; // orange
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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back, {getUserInfo()?.name || 'User'}!
          </Text>
          <Text style={styles.subtitleText}>
            Here is your dental health overview.
          </Text>

          <TouchableOpacity style={styles.bookButton} activeOpacity={0.8} onPress={() => navigation.navigate('Booking')}>
            <Plus size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.bookButtonText}>Book New Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* CURRENT APPOINTMENT SCHEDULE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Current Appointment Schedule</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{activeAppointments.length}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />
            ) : activeAppointments.length > 0 ? (
              activeAppointments.map((apt, index) => (
                <View key={apt.id} style={[styles.scheduleItem, index !== activeAppointments.length - 1 && styles.scheduleItemBorder]}>
                  <View style={styles.scheduleTimeContainer}>
                    <Text style={styles.scheduleTime}>{formatTime12h(apt.appointment_time)}</Text>
                    <Text style={styles.scheduleDate}>{new Date(apt.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </View>

                  <View style={styles.scheduleDetails}>
                    <View style={styles.doctorInfoRow}>
                      <Text style={styles.scheduleDoctor}>Dr. {apt.dentist_name}</Text>
                      {renderBadge(apt.status)}
                    </View>
                    <Text style={styles.scheduleService}>{apt.service_name}</Text>

                    <View style={styles.scheduleActions}>
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => navigation.navigate('Booking', { rescheduleApt: apt })}
                      >
                        <Text style={styles.rescheduleText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIconButton}
                        onPress={() => handleCancel(apt.id)}
                      >
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <AlertCircle size={40} color="#cbd5e1" />
                <Text style={styles.noDataText}>No active appointments found.</Text>
                <TouchableOpacity style={styles.smallBookButton} onPress={() => navigation.navigate('Booking')}>
                  <Text style={styles.smallBookButtonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* FLOATING CHATBOT */}
      <TouchableOpacity
        style={styles.chatbotBtn}
        activeOpacity={0.8}
        onPress={() => setIsChatBotVisible(true)}
      >
        <Image
          source={require('../assets/ai.png')}
          style={styles.chatbotIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* CHATBOT OVERLAY */}
      <Modal
        visible={isChatBotVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChatBotVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.chatbotContainer}>
            <View style={styles.chatbotHeader}>
              <Text style={styles.chatbotHeaderTitle}>AI Assistant</Text>
              <TouchableOpacity onPress={() => setIsChatBotVisible(false)} style={styles.chatbotCloseBtn}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            <ChatBot />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#e7f0fa', 
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '900', 
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#1d4ed8', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#1e3a8a', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
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
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 20,
  },
  scheduleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  scheduleTimeContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafbfc',
    borderRadius: 12,
    padding: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scheduleDate: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  scheduleDetails: {
    flex: 1,
  },
  doctorInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scheduleDoctor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  scheduleService: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 12,
  },
  scheduleActions: {
    flexDirection: 'row',
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  smallBookButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  smallBookButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatbotBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0ea5e9', 
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  chatbotIcon: {
    width: '100%',
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  chatbotContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    height: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  chatbotHeader: {
    backgroundColor: '#0ea5e9',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatbotHeaderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatbotCloseBtn: {
    padding: 4,
  },
});

export default DashboardScreen;

