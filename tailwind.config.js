/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: {
    colors: Object.fromEntries(Object.entries(require('./constants/palette.json')).map(([key,value])=>[key.replace(/[A-Z]/g,letter=>'-'+letter.toLowerCase()),value])),
    fontFamily: { arial: ['Arial'] },
    fontSize: { xs: 14, sm: 14, md: 16, lg: 18, xl: 22, '2xl': 28 },
    spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32, '3xl': 48 },
  } },
  plugins: [],
};
