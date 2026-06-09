import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Lock, LogOut, Trash2, ChevronRight } from 'lucide-react-native';
import api, { clearAuth, getUserInfo } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const user = getUserInfo();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ message: '', error: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordStatus({ message: '', error: 'Please fill in all password fields.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ message: '', error: 'Passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordStatus({ message: '', error: 'New password must be at least 8 characters long.' });
      return;
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordStatus({
        message: '',
        error: 'New password must be different from your current password.',
      });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus({ message: '', error: '' });
    try {
      const response = await api.patch('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordStatus({ message: response.data?.message || 'Password updated successfully!', error: '' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordStatus({
        message: '',
        error: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      "Are you sure you want to delete your account? This action cannot be undone, and you won't be able to re-register with this email for 10 minutes.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await api.post('/auth/delete-account');
              Alert.alert('Account Deleted', 'Your account has been deleted. You will now be logged out.');
              await clearAuth();
              navigation.replace('Login');
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to delete account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <Text style={styles.headerSubtitle}>
          Manage your account preferences.
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>

       
        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: '#eff6ff' }]}>
                <Lock size={18} color="#2563eb" />
              </View>
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>
            <ChevronRight
              size={18}
              color="#94a3b8"
              style={{ transform: [{ rotate: showPasswordSection ? '90deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <View style={styles.sectionBody}>
              {passwordStatus.message ? (
                <Text style={styles.successText}>{passwordStatus.message}</Text>
              ) : null}
              {passwordStatus.error ? (
                <Text style={styles.errorText}>{passwordStatus.error}</Text>
              ) : null}

              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordForm.currentPassword}
                onChangeText={v => setPasswordForm({ ...passwordForm, currentPassword: v })}
              />

              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordForm.newPassword}
                onChangeText={v => setPasswordForm({ ...passwordForm, newPassword: v })}
              />

              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordForm.confirmPassword}
                onChangeText={v => setPasswordForm({ ...passwordForm, confirmPassword: v })}
              />

              <TouchableOpacity
                style={[styles.updateBtn, passwordLoading && styles.btnDisabled]}
                onPress={handlePasswordChange}
                disabled={passwordLoading}
                activeOpacity={0.8}
              >
                {passwordLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.updateBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* DELETE ACCOUNT SECTION */}
        <View style={[styles.sectionCard, styles.dangerCard]}>
          <View style={styles.dangerContent}>
            <View>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.dangerSubtitle}>
                Permanently remove your account and all associated data.
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.deleteBtn, deleting && styles.btnDisabled]}
              onPress={handleDeleteAccount}
              disabled={deleting}
              activeOpacity={0.8}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Trash2 size={16} color="#fff" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

      
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <LogOut size={20} color="#ffffff" />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Dental Care Plus v1.0.0</Text>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0f172a',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  sectionBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  updateBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  updateBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  successText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#d1fae5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '700',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  dangerCard: {
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  dangerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#dc2626',
    marginBottom: 4,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    maxWidth: 200,
    lineHeight: 16,
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  logoutBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 20,
    shadowColor: '#1e293b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
});

export default SettingsScreen;
