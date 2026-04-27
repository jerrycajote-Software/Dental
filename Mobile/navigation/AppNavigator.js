import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BookingScreen from '../screens/BookingScreen';
import MedicalHistoryScreen from '../screens/MedicalHistoryScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
