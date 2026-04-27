import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { FileText, Calendar, User, Stethoscope, ChevronRight, Clock } from 'lucide-react-native';
import api from '../services/api';

const MedicalHistoryScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      fetchRecords();
    }, [])
  );

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical/records');
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderRecordCard = (record) => (
    <TouchableOpacity key={record.id} style={styles.recordCard} activeOpacity={0.7}>
      <View style={styles.recordHeader}>
        <View style={styles.dateContainer}>
          <Calendar size={16} stroke="#3b82f6" />
          <Text style={styles.dateText}>{formatDate(record.appointment_date)}</Text>
        </View>
        <View style={[styles.statusBadge, styles[record.appointment_status === 'completed' ? 'completedBadge' : 'pendingBadge']]}>
          <Text style={[styles.statusText, record.appointment_status === 'completed' ? 'completedText' : 'pendingText']}>
            {record.appointment_status?.charAt(0).toUpperCase() + record.appointment_status?.slice(1) || 'Completed'}
          </Text>
        </View>
      </View>

      <View style={styles.recordBody}>
        <View style={styles.infoRow}>
          <Stethoscope size={16} stroke="#64748b" />
          <Text style={styles.infoText}>Dr. {record.dentist_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <FileText size={16} stroke="#64748b" />
          <Text style={styles.infoText}>{record.service_name}</Text>
        </View>
      </View>

      {record.treatment_done && (
        <View style={styles.treatmentSection}>
          <Text style={styles.treatmentLabel}>Treatment:</Text>
          <Text style={styles.treatmentText}>{record.treatment_done}</Text>
        </View>
      )}

      {record.diagnosis && (
        <View style={styles.treatmentSection}>
          <Text style={styles.treatmentLabel}>Diagnosis:</Text>
          <Text style={styles.treatmentText}>{record.diagnosis}</Text>
        </View>
      )}

      <View style={styles.readMore}>
        <Text style={styles.readMoreText}>View Details</Text>
        <ChevronRight size={16} stroke="#3b82f6" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading medical records...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronRight size={24} stroke="#ffffff" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medical History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {records.length > 0 ? (
          records.map(renderRecordCard)
        ) : (
          <View style={styles.emptyContainer}>
            <FileText size={48} stroke="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Medical Records</Text>
            <Text style={styles.emptyText}>
              Your dental treatment history will appear here after your appointments are completed by the dentist.
            </Text>
          </View>
        )}

        {records.length > 0 && (
          <View style={styles.legendContainer}>
            <Text style={styles.legendTitle}>About Medical Records</Text>
            <Text style={styles.legendText}>
              Medical records are created after your dental appointment is marked as "Completed" by your dentist. 
              Each record contains diagnosis, treatment performed, and any prescriptions.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    backgroundColor: '#1089d3',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748b',
    fontSize: 14,
  },
  recordCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#dcfce7',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    color: '#16a34a',
  },
  pendingText: {
    color: '#d97706',
  },
  recordBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
  },
  treatmentSection: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  treatmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  treatmentText: {
    fontSize: 14,
    color: '#1e293b',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  legendContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#075985',
    lineHeight: 18,
  },
});

export default MedicalHistoryScreen;