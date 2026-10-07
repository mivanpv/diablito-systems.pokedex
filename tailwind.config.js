/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        dex: {
          ink: '#1e2533', // navy outlines, hard shadows, dark fills, viewer bezel
          page: '#e8eaed', // page background
          frame: '#d9dce1', // device body
          surface: '#f1f3f5', // section backgrounds
          paper: '#ffffff', // cards, inputs, buttons
          line: '#cfd5dd', // light borders and dashed dividers
          muted: '#6b7685', // secondary text
          accent: '#dc2638', // primary action, selected letter, Pokédex number
          'accent-dark': '#b51d2d',
          ok: '#16a34a',
        },
      },
      fontFamily: {
        // Titles, labels, numbers, buttons
        display: ['"Space Mono"', 'ui-monospace', 'monospace'],
        // Body text
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        hard: '0 2px 0 0 #1e2533',
        device: '0 6px 0 0 #1e2533',
      },
      keyframes: {
        blink: { '0%, 49%': { opacity: '1' }, '50%, 100%': { opacity: '0' } },
        pop: { '0%': { opacity: '0', transform: 'scale(0.3)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        fade: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        // slight overshoot so the evolution bubbles "pop" out of the sprite
        pop: 'pop 260ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        fade: 'fade 150ms ease-out both',
      },
    },
  },
  plugins: [],
};
