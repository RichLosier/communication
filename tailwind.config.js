/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'wx-blue': {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#b9dfff',
          300: '#7cc3ff',
          400: '#36a5ff',
          500: '#0088ff',
          600: '#0066ff',
          700: '#0055d4',
          800: '#0044aa',
          900: '#003a8c',
          950: '#00254d',
        },
      },
    },
  },
  plugins: [],
};