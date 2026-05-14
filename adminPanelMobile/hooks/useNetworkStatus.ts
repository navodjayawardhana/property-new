/**
 * Hook that tracks the device's network connectivity in real-time.
 *
 * Returns:
 *   isConnected         — false when the device has no network interface
 *   isInternetReachable — null until confirmed; false when connected but no internet
 *   isChecking          — true during the initial NetInfo.fetch() on mount
 *
 * Used by RootLayout to show the NoConnectionScreen overlay when offline.
 * Defaults to connected=true during the initial check so the app doesn't
 * flash the offline screen on a slow first check.
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

type NetworkStatus = {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isChecking: boolean;
};

export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    isChecking: true,
  });

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((netState: NetInfoState) => {
      setState({
        isConnected: netState.isConnected ?? true,
        isInternetReachable: netState.isInternetReachable,
        isChecking: false,
      });
    });

    // Subscribe to changes
    const unsubscribe = NetInfo.addEventListener((netState: NetInfoState) => {
      setState({
        isConnected: netState.isConnected ?? true,
        isInternetReachable: netState.isInternetReachable,
        isChecking: false,
      });
    });

    return unsubscribe;
  }, []);

  return state;
}
