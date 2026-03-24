import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { User, Lock } from 'lucide-react-native';
import api from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleRegister = async () => {
    const { name, email, password } = formData;

    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully! Please log in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User stroke="#000" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your Full Name"
              placeholderTextColor="#9ca3af"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              autoCapitalize="words"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.atIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              placeholderTextColor="#9ca3af"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Lock stroke="#000" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your Password"
              placeholderTextColor="#9ca3af"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.agreementRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={styles.checkbox}>
            {agreed && <View style={styles.checkboxInner} />}
          </View>
          <Text style={styles.agreementText}>
            I agree to the <Text style={styles.boldText}>Terms of Service</Text> and <Text style={styles.boldText}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Sign In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b65c5', // matches the blue from mockup
  },
  content: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  atIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingRight: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  agreementText: {
    color: '#ffffff',
    fontSize: 13,
    flex: 1,
    fontWeight: 'bold',
  },
  boldText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 30,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
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
  },
  footerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;

