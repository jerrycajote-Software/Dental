import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal
} from 'react-native';
import {
  Calendar, Clock, CheckCircle, XCircle, AlertCircle,
  MapPin, Plus, FileText, Activity, User as UserIcon, MessageCircle, X
} from 'lucide-react-native';
import api from '../services/api';
import ChatBot from '../components/ChatBot';

const DashboardScreen = ({ navigation }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isChatBotVisible, setIsChatBotVisible] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  const upcomingAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

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
      case 'completed': return { bg: '#d1fae5', text: '#059669', label: 'Completed' }; // emerald
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

  // Helper to format history date
  const formatShortDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome back!
          </Text>
          <Text style={styles.subtitleText}>
            Here is your dental health overview.
          </Text>

          <TouchableOpacity style={styles.bookButton} activeOpacity={0.8} onPress={() => navigation.navigate('Booking')}>
            <Plus size={20} color="#fff" strokeWidth={2.5} />
            <Text style={styles.bookButtonText}>Book New Appointment</Text>
          </TouchableOpacity>
        </View>

        {/* UPCOMING APPOINTMENT WIDGET */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={20} color="#2563eb" />
              <Text style={styles.cardTitle}>Upcoming Appointment</Text>
            </View>
            {nextAppointment ? renderBadge(nextAppointment.status) : null}
          </View>

          <View style={styles.cardBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#2563eb" style={{ marginVertical: 20 }} />
            ) : nextAppointment ? (
              <View style={styles.upcomingContent}>
                <View style={styles.upcomingRow1}>
                  <View style={styles.dateCircle}>
                    <Text style={styles.dateCircleText}>
                      {new Date(nextAppointment.appointment_date).getDate()}
                    </Text>
                  </View>
                  <View style={styles.upcomingDetails}>
                    <Text style={styles.doctorName}>Dr. {nextAppointment.dentist_name}</Text>
                    <Text style={styles.serviceText}>Dentist • {nextAppointment.service_name}</Text>
                  </View>
                </View>

                <View style={styles.upcomingRow2}>
                  <View style={styles.timeLocationContainer}>
                    <View style={styles.infoRow}>
                      <Clock size={16} color="#94a3b8" />
                      <Text style={styles.infoText}>
                        {formatTime12h(nextAppointment.appointment_time)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <MapPin size={16} color="#94a3b8" />
                      <Text style={styles.infoText}>Room 302</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity>
                    <Text style={styles.rescheduleText}>Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>No upcoming appointments scheduled.</Text>
            )}
          </View>
        </View>

        {/* QUICK ACTIONS WIDGET */}
        <View style={styles.card}>
          <View style={styles.cardBodyPadding}>
            <Text style={styles.cardTitleMargin}>Quick Actions</Text>
            <View style={styles.quickActionsContainer}>
              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#f0fdf4' }]} activeOpacity={0.7}>
                <FileText size={28} color="#059669" />
                <Text style={[styles.quickActionText, { color: '#059669' }]}>Records</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#faf5ff' }]} activeOpacity={0.7}>
                <Activity size={28} color="#9333ea" />
                <Text style={[styles.quickActionText, { color: '#9333ea' }]}>Treatments</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#fff7ed' }]} activeOpacity={0.7}>
                <UserIcon size={28} color="#ea580c" />
                <Text style={[styles.quickActionText, { color: '#ea580c' }]}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* APPOINTMENT HISTORY WIDGET */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitleNoIcon}>Appointment History</Text>
          </View>

          <View style={styles.tableBody}>
            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={[styles.tableColHeader, { flex: 1.2 }]}>DATE</Text>
              <Text style={[styles.tableColHeader, { flex: 1.5 }]}>DOCTOR</Text>
              <Text style={[styles.tableColHeader, { flex: 1.1 }]}>TYPE</Text>
              <Text style={[styles.tableColHeader, { flex: 1.2 }]}>STATUS</Text>
            </View>

            {/* Table Rows */}
            {pastAppointments.slice(0, 3).map((apt, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.2, fontWeight: '600' }]}>{formatShortDate(apt.appointment_date)}</Text>
                <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '500' }]}>Dr. {apt.dentist_name}</Text>
                <Text style={[styles.tableCell, { flex: 1.1, color: '#64748b' }]}>{apt.service_name}</Text>
                <View style={{ flex: 1.2, alignItems: 'flex-start' }}>
                  {renderBadge(apt.status)}
                </View>
              </View>
            ))}
            {pastAppointments.length === 0 && (
              <Text style={[styles.noDataText, { padding: 20 }]}>No past appointments.</Text>
            )}
          </View>
        </View>

      </ScrollView>

      {/* FLOATING CHATBOT ICON */}
      <TouchableOpacity
        style={styles.chatbotBtn}
        activeOpacity={0.8}
        onPress={() => setIsChatBotVisible(true)}
      >
        <MessageCircle size={30} color="#ffffff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* CHATBOT MODAL OVERLAY */}
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
    backgroundColor: '#e7f0fa', // matched exactly from web
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
    fontWeight: '900', // almost black
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
    backgroundColor: '#1d4ed8', // blue-700
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#1e3a8a', // blue-900
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
    borderColor: '#f1f5f9', // slate-100
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
  cardTitleNoIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardTitleMargin: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  cardBody: {
    padding: 20,
  },
  cardBodyPadding: {
    padding: 24,
  },
  badgeContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  upcomingContent: {
    flexDirection: 'column',
  },
  upcomingRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ebf5ff', // blue-50 equivalent close to design
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateCircleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2563eb',
  },
  upcomingDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  serviceText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  upcomingRow2: {
    marginBottom: 16,
  },
  timeLocationContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  rescheduleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb', // blue-600
  },
  cancelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444', // red-500
  },
  noDataText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 10,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  tableBody: {
    flexDirection: 'column',
  },
  tableRowHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableColHeader: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: '#1e293b',
    paddingRight: 4, // Prevents text overflow cutting closely
  },
  chatbotBtn: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#0ea5e9', // lighter blue distinct from the main action buttons
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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

