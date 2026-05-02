import React from 'react';
import { Image, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';

// Main Tab Screens
import DashboardScreen from '../screens/DashboardScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Sub-screens (accessible from Dashboard/Home tab)
import BookingScreen from '../screens/BookingScreen';
import MedicalHistoryScreen from '../screens/MedicalHistoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─────────────────────────────────────────────
// Home Stack: Dashboard + sub-screens
// ─────────────────────────────────────────────
const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
    </Stack.Navigator>
  );
};

// ─────────────────────────────────────────────
// Bottom Tab Navigator
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Root Auth Stack
// ─────────────────────────────────────────────
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dashboard" component={MainTabs} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
