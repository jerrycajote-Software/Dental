import * as Notifications from 'expo-notifications';
import api from './api';

export const registerForPushNotificationsAsync = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permissions not granted');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  try {
    await api.post('/notifications/register', { expo_push_token: token });
    console.log('Push token registered with server');
  } catch (error) {
    console.error('Failed to register push token:', error);
  }

  return token;
};

export default {
  registerForPushNotificationsAsync,
};