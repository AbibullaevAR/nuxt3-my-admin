import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    './src/**/*.{vue,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          light: '#f8f9fc',
          dark: '#0d1117',
        },
        sidebar: {
          DEFAULT: '#0f1117',
          hover: '#1a1f2e',
          active: '#1e2438',
          border: '#1e2438',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05)',
        'modal': '0 20px 60px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
