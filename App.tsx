import React from 'react';
import { StatusBar } from 'expo-status-bar';
import DateRideApp from './src/DateRideApp';

export default function App() {
  return (
    <>
      <DateRideApp />
      <StatusBar style="auto" />
    </>
  );
}