import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Lock } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Login logic here
    navigation.navigate('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.atIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
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
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={styles.checkbox}>
              {rememberMe && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2b65c5', // matches the blue from mockup
  },
  content: {
    flex: 1,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  rememberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#ffffff',
    fontSize: 14,
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
    marginBottom: 40,
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

export default LoginScreen;

