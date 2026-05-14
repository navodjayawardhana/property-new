/**
 * App-wide design token palette.
 *
 * `Colors`     — semantic colour aliases used throughout components and screens.
 *                Import this instead of hardcoding hex values.
 * `BadgeColors` — status-specific bg/text colour pairs for Badge components
 *                 (property status, loan type, news status, user role).
 *
 * Primary green: #16a34a (Tailwind green-600).
 * To change the brand colour, update `primary` and its light/dark variants here.
 */

export const Colors = {
  primary: '#16a34a',
  primaryLight: '#dcfce7',
  primaryDark: '#15803d',

  background: '#f9fafb',
  card: '#ffffff',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',

  text: '#111827',
  textSecondary: '#374151',
  textMuted: '#6b7280',
  textLight: '#9ca3af',

  danger: '#ef4444',
  dangerLight: '#fee2e2',
  dangerDark: '#dc2626',

  warning: '#f59e0b',
  warningLight: '#fef3c7',

  info: '#3b82f6',
  infoLight: '#dbeafe',

  purple: '#7c3aed',
  purpleLight: '#ede9fe',

  orange: '#f97316',
  orangeLight: '#ffedd5',

  teal: '#0d9488',
  tealLight: '#ccfbf1',

  indigo: '#4f46e5',
  indigoLight: '#e0e7ff',

  white: '#ffffff',
  black: '#000000',

  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

export const BadgeColors = {
  role: {
    buyer: { bg: '#dbeafe', text: '#1d4ed8' },
    seller: { bg: '#dcfce7', text: '#15803d' },
    agent: { bg: '#ede9fe', text: '#6d28d9' },
    admin: { bg: '#fee2e2', text: '#b91c1c' },
  },
  propertyStatus: {
    active: { bg: '#dcfce7', text: '#15803d' },
    inactive: { bg: '#f3f4f6', text: '#4b5563' },
    sold: { bg: '#ffedd5', text: '#c2410c' },
  },
  listingType: {
    buy: { bg: '#e0e7ff', text: '#4338ca' },
    rent: { bg: '#ccfbf1', text: '#0f766e' },
    sold: { bg: '#ffedd5', text: '#c2410c' },
  },
  inquiryStatus: {
    pending: { bg: '#fef3c7', text: '#b45309' },
    contacted: { bg: '#dbeafe', text: '#1d4ed8' },
    resolved: { bg: '#dcfce7', text: '#15803d' },
  },
  loanStatus: {
    new: { bg: '#dbeafe', text: '#1d4ed8' },
    in_review: { bg: '#fef3c7', text: '#b45309' },
    pre_approved: { bg: '#dcfce7', text: '#15803d' },
    declined: { bg: '#fee2e2', text: '#b91c1c' },
  },
  loanPurpose: {
    buy_home: { bg: '#dcfce7', text: '#15803d' },
    investment: { bg: '#dbeafe', text: '#1d4ed8' },
    refinance: { bg: '#ede9fe', text: '#6d28d9' },
  },
  loanType: {
    variable: { bg: '#dcfce7', text: '#15803d' },
    fixed: { bg: '#dbeafe', text: '#1d4ed8' },
    split: { bg: '#ede9fe', text: '#6d28d9' },
    interest_only: { bg: '#ffedd5', text: '#c2410c' },
  },
  newsStatus: {
    published: { bg: '#dcfce7', text: '#15803d' },
    draft: { bg: '#f3f4f6', text: '#4b5563' },
  },
};
