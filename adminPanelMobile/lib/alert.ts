/**
 * Global imperative toast/alert system.
 *
 * How it works:
 *   1. AppAlert component (mounted in RootLayout) registers itself as the handler.
 *   2. Call toast.success / toast.error / toast.warning / toast.info from anywhere
 *      in the app — no component reference or context needed.
 *   3. friendlyError(err) converts ApiError / network errors into user-readable strings,
 *      hiding internal details for 5xx errors.
 */

// ─── Alert types ──────────────────────────────────────────────────────────────

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export type AlertPayload = {
  type: AlertType;
  title: string;
  message?: string;
  duration?: number;
};

// ─── Global imperative handler (registered by AppAlert component) ─────────────

type Handler = (payload: AlertPayload) => void;
let _handler: Handler | null = null;

export function registerAlertHandler(fn: Handler | null) {
  _handler = fn;
}

// ─── Public API — call these anywhere in the app ──────────────────────────────

export function showAlert(type: AlertType, title: string, message?: string, duration = 3500) {
  _handler?.({ type, title, message, duration });
}

export const toast = {
  success: (title: string, message?: string) => showAlert('success', title, message),
  error:   (title: string, message?: string) => showAlert('error',   title, message),
  warning: (title: string, message?: string) => showAlert('warning', title, message),
  info:    (title: string, message?: string) => showAlert('info',    title, message),
};

// ─── Friendly error message helper ───────────────────────────────────────────

export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!err) return fallback;

  if (err instanceof Error) {
    const status = (err as { status?: number }).status;

    if (status === 401 || status === 403) return 'Access denied. Please sign in again.';
    if (status === 404)                   return 'The requested item was not found.';
    if (status === 422)                   return err.message; // validation — already user-friendly
    if (status !== undefined && status >= 500) return 'Server error. Please try again later.';
    if (err.name === 'AbortError')        return 'Request timed out. Please check your connection.';

    // Only surface message for API errors (they're sanitised); swallow others
    if (status !== undefined && err.message) return err.message;
  }

  return fallback;
}
