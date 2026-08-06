export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryMuted: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  success: string;
  successLight: string;
  danger: string;
  dangerLight: string;
  warning: string;
  warningLight: string;
};

export const lightColors: ThemeColors = {
  primary: "#6C5CE7",
  primaryDark: "#5A4BD1",
  primaryLight: "#F0EDFF",
  primaryMuted: "#B8B0F0",
  background: "#F8F7FC",
  surface: "#FFFFFF",
  surfaceElevated: "#FFFFFF",
  border: "#ECEAF5",
  borderMuted: "#DDD9EE",
  textPrimary: "#1A1633",
  textSecondary: "#57526E",
  textMuted: "#9490AB",
  success: "#00C48C",
  successLight: "#E6FAF3",
  danger: "#FF4757",
  dangerLight: "#FFF0F0",
  warning: "#FFAA33",
  warningLight: "#FFF8EC",
};

export const darkColors: ThemeColors = {
  primary: "#7C6CF0",
  primaryDark: "#6C5CE7",
  primaryLight: "#1E1A3F",
  primaryMuted: "#3D3578",
  background: "#0F1117",
  surface: "#1C1F2E",
  surfaceElevated: "#252838",
  border: "#2A2D3E",
  borderMuted: "#1E2130",
  textPrimary: "#F3F4F6",
  textSecondary: "#9CA3AF",
  textMuted: "#6B7280",
  success: "#00C48C",
  successLight: "#0D2B1E",
  danger: "#FF4757",
  dangerLight: "#2B0D10",
  warning: "#F59E0B",
  warningLight: "#2B1C00",
};

// Backward compatibility
export const AppColors = lightColors;
