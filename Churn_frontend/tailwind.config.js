/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Geist"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Palette is driven by CSS variables (see src/index.css) so the whole
        // UI can switch between light and night mode without per-class dark: variants.
        ink: {
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          800: 'rgb(var(--ink-800) / <alpha-value>)',
          700: 'rgb(var(--ink-700) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          500: 'rgb(var(--ink-500) / <alpha-value>)',
        },
        bone: {
          50: 'rgb(var(--bone-50) / <alpha-value>)',
          100: 'rgb(var(--bone-100) / <alpha-value>)',
          200: 'rgb(var(--bone-200) / <alpha-value>)',
          300: 'rgb(var(--bone-300) / <alpha-value>)',
          400: 'rgb(var(--bone-400) / <alpha-value>)',
          500: 'rgb(var(--bone-500) / <alpha-value>)',
        },
        ember: {
          300: 'rgb(var(--ember-300) / <alpha-value>)',
          400: 'rgb(var(--ember-400) / <alpha-value>)',
          500: 'rgb(var(--ember-500) / <alpha-value>)',
          600: 'rgb(var(--ember-600) / <alpha-value>)',
        },
        moss: {
          400: 'rgb(var(--moss-400) / <alpha-value>)',
          500: 'rgb(var(--moss-500) / <alpha-value>)',
          600: 'rgb(var(--moss-600) / <alpha-value>)',
        },
        rust: {
          400: 'rgb(var(--rust-400) / <alpha-value>)',
          500: 'rgb(var(--rust-500) / <alpha-value>)',
          600: 'rgb(var(--rust-600) / <alpha-value>)',
        },
        // Fixed near-black that never flips; used for modal scrims.
        scrim: '#050505',
      },
      boxShadow: {
        lift: '0 18px 60px rgb(10 10 10 / 0.14)',
      },
    },
  },
  plugins: [],
}
