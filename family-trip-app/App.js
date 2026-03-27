import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { TripProvider } from './src/context/TripContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <TripProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </TripProvider>
  );
}
