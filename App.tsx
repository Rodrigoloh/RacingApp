import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import SessionHUD from './app/session-hud';

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <SessionHUD />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }
});

