import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BookingScreen from '../screens/BookingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: 'bold' },
        headerTintColor: '#3b82f6',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'My Dashboard' }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'New Appointment' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
