/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc8fc',
          400: '#36aff8',
          500: '#0c94e8',
          600: '#0075c7',
          700: '#005da3',
          800: '#044f86',
          900: '#0a426f',
          950: '#072a4a',
        },
        dark: {
          bg: '#0b0f19',
          card: '#131b2e',
          border: '#1e293b',
          subtle: '#182238'
        },
        gold: '#f59e0b',
        emerald: '#10b981',
        rose: '#f43f5e',
        purple: '#8b5cf6',
        cyan: '#06b6d4'
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
