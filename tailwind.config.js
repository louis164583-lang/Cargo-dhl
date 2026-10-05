/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dhl: {
          red: '#D40511',
          yellow: '#FFCC00',
          dark: '#1A1A1A',
          darker: '#0D0D0D',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-late': 'float 6s 3s ease-in-out infinite',
        shimmer: 'shimmer 4s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.5' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
