/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        poke: {
          red: '#e3350d',
          dark: '#1f2937',
          yellow: '#ffcb05',
        },
      },
    },
  },
  plugins: [],
};
