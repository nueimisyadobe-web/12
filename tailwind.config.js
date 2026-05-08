/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0f',
          800: '#0d0d14',
          700: '#12121a',
          600: '#1a1a25',
        },
        gold: {
          400: '#f5c842',
          500: '#d4a017',
          600: '#b8860b',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(-100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
