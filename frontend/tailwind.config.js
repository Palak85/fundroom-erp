/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F3FC',
          100: '#E1E7F9',
          200: '#C7D3F4',
          300: '#A4B8EC',
          400: '#7E98E2',
          500: '#5E72C6', // Exact Primary from Design System
          600: '#485CB4',
          700: '#384898',
          800: '#2A3674',
          900: '#1B234C',
          DEFAULT: '#5E72C6',
        },
        tertiary: {
          50: '#FDF2F4',
          100: '#FCE4E8',
          200: '#F9CCD4',
          300: '#F49EB0',
          400: '#EC6180',
          500: '#D30F38', // Exact Tertiary Crimson from Design System
          600: '#B80D31',
          700: '#950B27',
          800: '#73091E',
          900: '#520615',
          DEFAULT: '#D30F38',
        },
        neutral: {
          50: '#F7F7F8',
          100: '#EFEFEF',
          200: '#DFDFE1',
          300: '#C5C4C8',
          400: '#9C9B9F',
          500: '#77767D', // Exact Neutral Grey from Design System
          600: '#5F5E64',
          700: '#49484D',
          800: '#343337',
          900: '#212023',
          DEFAULT: '#77767D',
        },
        inverted: {
          light: '#3C404A',
          DEFAULT: '#2D3139',
          dark: '#23272F',
        },
        canvas: '#E4E7F0',
        subtle: '#EEF0F6',
        card: '#FFFFFF',
        borderline: '#DCE0EB',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(94, 114, 198, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 25px -4px rgba(94, 114, 198, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'btn': '0 4px 14px -2px rgba(94, 114, 198, 0.35)',
        'danger-btn': '0 4px 14px -2px rgba(211, 15, 56, 0.3)',
      }
    },
  },
  plugins: [],
}
