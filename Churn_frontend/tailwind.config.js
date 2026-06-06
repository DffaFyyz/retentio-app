/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0a0a0a',
          800: '#141414',
          700: '#1c1c1c',
          600: '#262626',
          500: '#3a3a3a',
        },
        bone: {
          50: '#fafaf7',
          100: '#f4f3ee',
          200: '#e8e6dc',
          300: '#d4d1c4',
          400: '#9a978a',
          500: '#6b6960',
        },
        ember: {
          400: '#ff8c5a',
          500: '#ff6b35',
          600: '#e85220',
        },
        moss: {
          400: '#7ba05b',
          500: '#5d8043',
          600: '#456030',
        },
        rust: {
          400: '#c75d3e',
          500: '#a8442a',
          600: '#87351f',
        },
      },
      boxShadow: {
        lift: '0 18px 60px rgb(10 10 10 / 0.14)',
      },
    },
  },
  plugins: [],
}
