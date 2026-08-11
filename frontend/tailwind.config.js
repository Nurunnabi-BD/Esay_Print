/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light: 'var(--color-danger-light)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
        },
        sidebar: {
          DEFAULT: 'var(--color-sidebar)',
          hover: 'var(--color-sidebar-hover)',
          active: 'var(--color-sidebar-active)',
        },
        footer: {
          DEFAULT: 'var(--color-footer)',
          text: 'var(--color-footer-text)',
          link: 'var(--color-footer-link)',
          hover: 'var(--color-footer-hover)',
        },
        brand: {
          50: 'var(--color-primary-light)',
          100: 'var(--color-secondary-light)',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: 'var(--color-info)',
          600: 'var(--color-primary)',
          700: 'var(--color-primary-dark)',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        dark: {
          50: '#090d16',
          100: 'var(--color-text-primary)',
          200: 'var(--color-sidebar-hover)',
          300: '#d1d5db',
          400: 'var(--color-text-secondary)',
          500: 'var(--color-text-secondary)',
          600: 'var(--color-text-muted)',
          700: 'var(--color-footer-text)',
          800: 'var(--color-border)',
          850: '#1e293b',
          900: 'var(--color-background)',
          950: 'var(--color-card)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
