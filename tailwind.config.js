/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3f9',
          100: '#d9e0ef',
          200: '#b3c1df',
          300: '#8da2cf',
          400: '#5e74b3',
          500: '#3a4f8a',
          600: '#2c3a66',
          700: '#1f2a4d',
          800: '#16203a',
          900: '#0e1729',
          950: '#070d1a',
        },
        gold: {
          50: '#fbf7ee',
          100: '#f5ecd5',
          200: '#ebd9ad',
          300: '#e0c384',
          400: '#d4a857',
          500: '#c8933a',
          600: '#a8762d',
          700: '#855a26',
          800: '#5f4020',
          900: '#3d2916',
        },
        ivory: {
          50: '#fefdfb',
          100: '#fdfaf4',
          200: '#faf4e8',
          300: '#f5ecd6',
          400: '#efe2c2',
          500: '#e6d4a8',
        },
        charcoal: {
          50: '#f6f6f5',
          100: '#e7e7e5',
          200: '#d0d0cc',
          300: '#a8a8a1',
          400: '#7a7a72',
          500: '#52524c',
          600: '#3b3b36',
          700: '#2a2a26',
          800: '#1c1c19',
          900: '#0f0f0e',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.75rem, 7vw, 6rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'h1': ['clamp(1.875rem, 3.5vw, 3rem)', { lineHeight: '1.15' }],
        'h2': ['clamp(1.5rem, 2.8vw, 2.25rem)', { lineHeight: '1.2' }],
        'h3': ['clamp(1.25rem, 2vw, 1.75rem)', { lineHeight: '1.25' }],
      },
      spacing: {
        section: 'clamp(4rem, 8vw, 7rem)',
        'section-sm': 'clamp(3rem, 5vw, 4.5rem)',
      },
      borderRadius: {
        luxury: '0.5rem',
        'luxury-lg': '1rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(14, 23, 41, 0.06)',
        'soft-md': '0 8px 24px -8px rgba(14, 23, 41, 0.1)',
        'soft-lg': '0 16px 48px -12px rgba(14, 23, 41, 0.14)',
        gold: '0 8px 24px -8px rgba(200, 147, 58, 0.25)',
      },
      maxWidth: {
        luxury: '84rem',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        luxury: '500ms',
        'luxury-slow': '800ms',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'draw-line': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        'scale-in': 'scale-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'draw-line': 'draw-line 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};
