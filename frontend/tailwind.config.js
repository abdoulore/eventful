/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff1ef',
          100: '#ffe1dd',
          200: '#ffc7c0',
          300: '#ff9b8f',
          500: '#e14a3b',
          600: '#c93529',
          700: '#a92d24',
          900: '#5f1714',
        },
        surface: {
          0:   '#ffffff',
          50:  '#f5f7f4',
          100: '#ecefeb',
          200: '#dfe5de',
          300: '#cbd5ca',
          900: '#121712',
        },
        ink: {
          900: '#111712',
          700: '#2d3a30',
          600: '#4a574d',
          500: '#69756b',
          400: '#96a095',
          300: '#c8d0c7',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl:  '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 14px 40px rgba(45, 58, 48, 0.08)',
        elevated: '0 24px 70px rgba(45, 58, 48, 0.14)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.74)',
      },
    },
  },
  plugins: [],
};
