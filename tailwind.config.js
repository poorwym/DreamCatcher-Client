/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s infinite',
        'slide-in': 'slideIn 0.6s ease-out forwards',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px) rotate(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-20px) rotate(1deg)' 
          },
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)',
            opacity: '1',
          },
          '80%, 100%': {
            transform: 'scale(2.4)',
            opacity: '0',
          },
        },
        slideIn: {
          from: {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        bounceIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.1)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'gradient-shift': {
          '0%, 100%': {
            'background-position': '0% 50%',
          },
          '50%': {
            'background-position': '100% 50%',
          },
        },
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
} 