import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import CoachScreen from '../screens/CoachScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Dashboard: undefined;
  Coach: { mode: string };
  History: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MotionTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00D4FF',
    background: '#020208',
    card: '#020208',
    text: '#FFFFFF',
    border: 'rgba(255, 255, 255, 0.1)',
    notification: '#FF3B5C',
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={MotionTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#020208' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Coach" component={CoachScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
