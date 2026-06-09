import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/web');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/web/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/web/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      Alert.alert('Error', 'Failed to mark all as read.');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' • ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
     
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated with your appointment activities.
          </Text>
        </View>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 60 }} />
        ) : notifications.length > 0 ? (
          notifications.map(n => (
            <TouchableOpacity
              key={n.id}
              activeOpacity={n.is_read ? 1 : 0.7}
              onPress={() => !n.is_read && markAsRead(n.id)}
              style={[
                styles.notifCard,
                n.is_read ? styles.notifRead : styles.notifUnread,
              ]}
            >
              <View
                style={[
                  styles.notifIcon,
                  n.is_read ? styles.notifIconRead : styles.notifIconUnread,
                ]}
              >
                <Bell size={18} color={n.is_read ? '#94a3b8' : '#ffffff'} />
              </View>

              <View style={styles.notifBody}>
                <View style={styles.notifTopRow}>
                  <Text
                    style={[
                      styles.notifTitle,
                      n.is_read && styles.notifTitleRead,
                    ]}
                    numberOfLines={1}
                  >
                    {n.title}
                  </Text>
                  <Text style={styles.notifDate}>{formatDate(n.created_at)}</Text>
                </View>
                <Text
                  style={[
                    styles.notifMessage,
                    n.is_read && styles.notifMessageRead,
                  ]}
                >
                  {n.message}
                </Text>
              </View>

              {!n.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Bell size={40} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>Your notification center is empty</Text>
            <Text style={styles.emptySubtitle}>
              We'll keep you posted here when there are updates to your appointments or clinic news.
            </Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#e7f0fa',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  markAllBtn: {
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 20,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#2563eb',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  notifRead: {
    backgroundColor: '#ffffff',
    borderColor: '#f1f5f9',
    opacity: 0.7,
  },
  notifUnread: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifIconRead: {
    backgroundColor: '#f1f5f9',
  },
  notifIconUnread: {
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  notifBody: {
    flex: 1,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0f172a',
    flex: 1,
  },
  notifTitleRead: {
    color: '#475569',
  },
  notifDate: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    flexShrink: 0,
  },
  notifMessage: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    lineHeight: 18,
  },
  notifMessageRead: {
    color: '#64748b',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563eb',
    marginTop: 4,
    marginLeft: 8,
    flexShrink: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;
