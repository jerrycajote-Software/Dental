import React, { useState, useEffect } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';


import LoginScreen from '../screens/LoginScreen';


import DashboardScreen from '../screens/DashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';


import BookingScreen from '../screens/BookingScreen';
import AppointmentHistoryScreen from '../screens/AppointmentHistoryScreen';

import { initializeAuth } from '../services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="AppointmentHistory" component={AppointmentHistoryScreen} />
    </Stack.Navigator>
  );
};



const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarIcon: ({ focused }) => {
          let iconSource;
          if (route.name === 'Home') {
            iconSource = require('../assets/overview.png');
          } else if (route.name === 'Notifications') {
            iconSource = require('../assets/bell.png');
          } else if (route.name === 'Settings') {
            iconSource = require('../assets/settings.png');
          }

          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 10,
                backgroundColor: focused ? '#eff6ff' : 'transparent',
                padding: focused ? 4 : 0,
              }}
            >
              <Image
                source={iconSource}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: focused ? '#2563eb' : '#94a3b8',
                }}
                resizeMode="contain"
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Overview' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
};



const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await initializeAuth();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a237e' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isAuthenticated ? 'Dashboard' : 'Login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
