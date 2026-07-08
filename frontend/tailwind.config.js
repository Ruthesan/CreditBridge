/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEF0FD',
          100: '#E0E1FB',
          200: '#C2C4F7',
          300: '#9A9CF0',
          400: '#7A76E8',
          500: '#4F46E5',
          600: '#4338CA',
          700: '#3730A3',
          800: '#2E2A82',
          900: '#252162',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          50: '#F3EBFE',
          100: '#E6D5FC',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        success: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          600: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B',
          50: '#FFFBEB',
          100: '#FEF3C7',
          600: '#D97706',
        },
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          100: '#FEE2E2',
          600: '#DC2626',
        },
        surface: '#F8FAFC',
        sidebar: '#111827',
        ink: {
          DEFAULT: '#111827',
          secondary: '#6B7280',
        },
        line: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17, 24, 39, 0.04), 0 8px 24px -8px rgba(17, 24, 39, 0.08)',
        card: '0 1px 3px rgba(17, 24, 39, 0.06), 0 1px 2px rgba(17, 24, 39, 0.04)',
        lift: '0 12px 32px -12px rgba(79, 70, 229, 0.25)',
        glow: '0 0 0 4px rgba(79, 70, 229, 0.10)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.9)', opacity: 1 }, '100%': { transform: 'scale(1.6)', opacity: 0 } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')({ strategy: 'class' })],
};
