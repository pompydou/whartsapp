import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register-method" />
        <Stack.Screen name="register-mobile" />
        <Stack.Screen name="login-mobile" />
        <Stack.Screen name="select-country" />
        <Stack.Screen name="verify-phone" />
        <Stack.Screen name="restore-backup" />
        <Stack.Screen name="setup-email" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="discussion/[id]" />
      </Stack>
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
