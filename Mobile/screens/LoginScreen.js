import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react-native';
import api, { setAuthToken, setUserInfo } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      const { user, token } = response.data;

      // Restriction: Only 'user' role permitted on mobile
      if (user.role === 'admin' || user.role === 'doctor') {
        Alert.alert(
          'Access Restricted',
          `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} accounts are restricted to the web version at this time.`
        );
        setLoading(false);
        return;
      }

      // Save token and info, then replace stack with Dashboard
      setAuthToken(token);
      setUserInfo(user);
      navigation.replace('Dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.heading}>Sign In</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail stroke="#94a3b8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock stroke="#94a3b8" size={20} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff stroke="#94a3b8" size={20} />
                  ) : (
                    <Eye stroke="#94a3b8" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.7} style={styles.forgotPassword}>
              <Text style={styles.forgotText}>Forgot Password ?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleLogin} 
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e', // Base dark blue from web gradient
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#F8F9FD',
    borderRadius: 40,
    padding: 30,
    paddingVertical: 40,
    borderWidth: 5,
    borderColor: '#ffffff',
    shadowColor: '#85bdd7',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  heading: {
    textAlign: 'center',
    fontWeight: '900',
    fontSize: 28,
    color: '#1089d3', // rgb(16, 137, 211)
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    height: 55,
    shadowColor: '#cff0ff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  forgotPassword: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 20,
  },
  forgotText: {
    color: '#0099ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#1089d3',
    borderRadius: 20,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#85bdd7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    color: '#aaa',
    fontSize: 12,
  },
  linkText: {
    color: '#0099ff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

