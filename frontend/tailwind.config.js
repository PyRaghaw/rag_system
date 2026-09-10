/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          canvas: '#FEFAF6',
          surface: '#EADBC8',
          border: '#DAC0A3',
          navy: '#102C57',
          surfaceHover: '#E2D1BD',
          borderLight: '#E8D5BF',
          navyMuted: '#1E3E62',
        },
        navyDark: {
          bg: '#0B192C',
          surface: '#102C57',
          card: '#16386D',
          border: '#24487A',
          text: '#FEFAF6',
          muted: '#DAC0A3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(16, 44, 87, 0.05)',
        card: '0 1px 3px 0 rgba(16, 44, 87, 0.08), 0 1px 2px -1px rgba(16, 44, 87, 0.06)',
        elevated: '0 10px 25px -5px rgba(16, 44, 87, 0.12), 0 8px 10px -6px rgba(16, 44, 87, 0.08)',
        glow: '0 0 25px -5px rgba(218, 192, 163, 0.4)',
        warm: '0 4px 20px -2px rgba(218, 192, 163, 0.35)',
      },
    },
  },
  plugins: [],
};
