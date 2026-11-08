/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#d4af37', soft: '#b8902b', light: '#f3d888' },
        royal: { DEFAULT: '#2b86ff', deep: '#0e3a7a', light: '#5ea8ff' },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Poppins', 'sans-serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
    },
  },
  plugins: [],
}
