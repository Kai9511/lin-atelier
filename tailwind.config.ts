import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f6f2',
        ink: '#191918',
        muted: '#6d6b66',
        line: '#d9d7d0',
        mat: '#ebe9e3',
      },
      fontFamily: {
        display: ['var(--font-libre-caslon)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.18em',
        wide2: '0.24em',
      },
      transitionTimingFunction: {
        gallery: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'page-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'page-in': 'page-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease both',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
