export const colors = {
  background: "#F6F7F5",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F3F2",
  text: "#17201E",
  muted: "#68736F",
  border: "#E2E6E3",
  primary: "#E8A317",
  primaryPressed: "#D39112",
  primaryDark: "#8A5A08",
  success: "#357A57",
  warning: "#A96D0A",
  danger: "#A64747",
  info: "#47749B",
} as const;

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, xxl: 40 } as const;
export const radius = { sm: 12, md: 18, lg: 24, pill: 999 } as const;
export const typography = { screen: 30, section: 19, cardTitle: 16, body: 15, caption: 13, money: 24 } as const;
export const shadows = { card: { shadowColor: "#17201E", shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 2 } } as const;
