/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './vite-entry.html', './roxmidia-landing.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Instrument Serif'", 'Georgia', 'serif'],
        sans: ["'Inter'", '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
