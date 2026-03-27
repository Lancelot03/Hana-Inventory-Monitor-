/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#E4E3E0',
        ink: '#141414',
        accent: '#3A7467',
        alarm: '#B63B3B',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        grid: '0 0 0 1px #14141422, inset 0 0 0 1px #14141414',
      },
    },
  },
  plugins: [],
};
