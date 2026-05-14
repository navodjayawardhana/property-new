/**
 * App entry point / auth gate.
 * Decides where to navigate based on the current session state:
 *   - Still loading  → show spinner while AsyncStorage + /me are checked
 *   - Logged in      → redirect to /(admin) dashboard
 *   - Not logged in  → redirect to /(auth)/login
 */

import { Redirect } from 'expo-router';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/lib/auth';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="Verifying your session…" />;
  }

  if (user) {
    return <Redirect href="/(admin)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
