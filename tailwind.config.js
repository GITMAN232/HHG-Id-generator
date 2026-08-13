/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        goa: {
          darkest: '#061812',
          deep: '#0A2920',
          medium: '#0D382C',
          light: '#145141',
          accent: '#206B5E',
        },
        sand: {
          gold: '#E3C578',
          warm: '#D4AF37',
          light: '#FAF6EE',
          parchment: '#F3EBDD',
        },
        pink: {
          neon: '#FF2A85',
          hot: '#FF006E',
          glow: '#FF5C9D',
        },
        cyber: {
          cyan: '#00F0FF',
          green: '#00FF66',
          terminal: '#0D1F1C',
        },
        ink: {
          dark: '#060E0C',
          card: '#0A1412',
          border: '#1A332C',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        serif: ['Cinzel', 'serif'],
      },
      animation: {
        'light-sweep': 'sweep 4s ease-in-out infinite',
        'holo-shift': 'holo 6s ease infinite alternate',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'translateX(-100%) translateY(-100%) rotate(45deg)', opacity: '0' },
          '30%': { opacity: '0.8' },
          '60%': { opacity: '0.8' },
          '100%': { transform: 'translateX(200%) translateY(200%) rotate(45deg)', opacity: '0' },
        },
        holo: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(255, 42, 133, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(255, 42, 133, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      },
      boxShadow: {
        'goa-glow': '0 0 50px -10px rgba(11, 43, 38, 0.8), 0 0 30px -5px rgba(255, 209, 102, 0.3)',
        'pink-glow': '0 0 35px -5px rgba(255, 42, 133, 0.5)',
        'gold-glow': '0 0 35px -5px rgba(255, 209, 102, 0.5)',
        'cyber-glow': '0 0 35px -5px rgba(0, 240, 255, 0.5)',
        'card-depth': '0 30px 60px -12px rgba(0, 0, 0, 0.75), 0 18px 36px -18px rgba(0, 0, 0, 0.85)',
      }
    },
  },
  plugins: [],
};
