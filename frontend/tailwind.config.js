export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad7ad',
          300: '#f6bb79',
          400: '#f19543',
          500: '#ed7620',
          600: '#de5c16',
          700: '#b84514',
          800: '#933818',
          900: '#773016',
        },
        dark: {
          50: '#f7f7f8',
          100: '#eeeef0',
          200: '#d9d9de',
          300: '#b8b8c1',
          400: '#91919f',
          500: '#737384',
          600: '#5d5d6c',
          700: '#4c4c58',
          800: '#41414b',
          900: '#1a1a1f',
          950: '#0d0d10',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

