import { MD3LightTheme, configureFonts } from "react-native-paper";

const fontConfig = {
  displayLarge: {
    fontFamily: "Georgia",
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  displayMedium: {
    fontFamily: "Georgia",
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  displaySmall: {
    fontFamily: "Georgia",
    fontSize: 28,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  headlineLarge: {
    fontFamily: "Georgia",
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  headlineMedium: {
    fontFamily: "Georgia",
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  headlineSmall: {
    fontFamily: "Georgia",
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  titleLarge: {
    fontFamily: "Georgia",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  titleMedium: {
    fontFamily: "Georgia",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  titleSmall: {
    fontFamily: "Georgia",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.05,
  },
  bodyLarge: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.1,
  },
  bodyMedium: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.15,
  },
  bodySmall: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.2,
  },
  labelLarge: {
    fontFamily: "System",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: "System",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  labelSmall: {
    fontFamily: "System",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
};

// STYLEMORPH Theme
const StylemorphTheme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,
    primary: "#333333", // Rich charcoal gray
    primaryContainer: "#E5E5E5", // Soft light gray
    secondary: "#8C7A6B", // Subtle taupe/brown (earth tone)
    secondaryContainer: "#EFE7E1", // Warm beige
    tertiary: "#C2B8A3", // Soft muted gold
    tertiaryContainer: "#F4F1EA", // Off-white with a warm tint
    background: "#FAFAFA", // Near-white background
    surface: "#FFFFFF",
    surfaceVariant: "#F0F0F0",
    error: "#B00020",
    errorContainer: "#FCD8DF",
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#1C1C1C",
    onSecondary: "#FFFFFF",
    onSecondaryContainer: "#3B2F28",
    onTertiary: "#2E2B26",
    onTertiaryContainer: "#5A5045",
    onSurface: "#1C1C1C",
    onSurfaceVariant: "#49454F",
    outline: "#D0CFCF",
    outlineVariant: "#B6B6B6",
    shadow: "rgba(0, 0, 0, 0.1)",
    scrim: "rgba(0, 0, 0, 0.3)",
    inverseSurface: "#2D2D2D",
    inverseOnSurface: "#F5F5F5",
    inversePrimary: "#AAA6A0",
  },

  fonts: configureFonts({ config: fontConfig }),

  roundness: 16,

  animation: {
    scale: 1.0,
  },

  custom: {
    gradients: {
      primary: ["#333333", "#666666"],
      secondary: ["#8C7A6B", "#A89B91"],
      tertiary: ["#C2B8A3", "#D7CDBF"],
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    shadows: {
      small: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 1.0,
        elevation: 1,
      },
      medium: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 4.0,
        elevation: 4,
      },
      large: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 6.0,
        elevation: 6,
      },
    },
  },
};

export default StylemorphTheme;
