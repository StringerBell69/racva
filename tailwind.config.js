/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Jakarta: ["Jakarta", "sans-serif"],
        JakartaBold: ["Jakarta-Bold", "sans-serif"],
        JakartaExtraBold: ["Jakarta-ExtraBold", "sans-serif"],
        JakartaExtraLight: ["Jakarta-ExtraLight", "sans-serif"],
        JakartaLight: ["Jakarta-Light", "sans-serif"],
        JakartaMedium: ["Jakarta-Medium", "sans-serif"],
        JakartaSemiBold: ["Jakarta-SemiBold", "sans-serif"],
      },
      colors: {
        primary: {
          100: "#F5F8FF", // Soft light blue
          200: "#EBF4FF", // Lighter blue
          300: "#C3D9FF", // Cool light blue
          400: "#9BBFFF", // Light blue
          500: "#D4AF37", // Bright blue
          600: "#6A85E6", // Soft indigo
          700: "#475A99", // Medium blue
          800: "#364573", // Dark blue
          900: "#242B4D", // Deep navy blue
        },
        secondary: {
          100: "#F8F8F8", // Light gray
          200: "#F1F1F1", // Very light gray
          300: "#D9D9D9", // Light gray
          400: "#C2C2C2", // Mid gray
          500: "#AAAAAA", // Neutral gray
          600: "#999999", // Darker gray
          700: "#666666", // Charcoal gray
          800: "#4D4D4D", // Almost black gray
          900: "#333333", // Almost black gray
        },
        success: {
          100: "#F0FFF4", // Light mint
          200: "#C6F6D5", // Soft green
          300: "#9AE6B4", // Fresh mint green
          400: "#68D391", // Medium green
          500: "#38A169", // Rich green
          600: "#2F855A", // Forest green
          700: "#276749", // Dark green
          800: "#22543D", // Very dark green
          900: "#1C4532", // Almost black green
        },
        danger: {
          100: "#FFF5F5", // Soft pink
          200: "#FED7D7", // Light red
          300: "#FEB2B2", // Rose red
          400: "#FC8181", // Red
          500: "#F56565", // Bright red
          600: "#E53E3E", // Dark red
          700: "#C53030", // Deep red
          800: "#9B2C2C", // Burgundy
          900: "#742A2A", // Dark burgundy
        },
        warning: {
          100: "#FFFBEB", // Soft yellow
          200: "#FEF3C7", // Pale yellow
          300: "#FDE68A", // Light golden yellow
          400: "#FACC15", // Bright yellow
          500: "#EAB308", // Gold yellow
          600: "#CA8A04", // Golden yellow
          700: "#A16207", // Strong gold
          800: "#854D0E", // Golden brown
          900: "#713F12", // Deep golden brown
        },
        general: {
          100: "#CED1DD", // Light grayish blue
          200: "#858585", // Medium gray
          300: "#EEEEEE", // Very light gray
          400: "#0CC25F", // Bright green
          500: "#F6F8FA", // Off-white
          600: "#E6F3FF", // Pale blue
          700: "#EBEBEB", // Light gray
          800: "#ADADAD", // Medium gray
        },
        // Custom gold color for premium look
        gold: {
          DEFAULT: "#D4AF37", // Standard gold
          dark: "#CA8A04", // Darker gold
        }, // Premium gold
      },
    },
  },
  plugins: [],
};
