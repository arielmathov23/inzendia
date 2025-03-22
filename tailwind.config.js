/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Eczar',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Open Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
        cooper: ['Eczar', 'serif'],
      },
      colors: {
        background: '#E5E4E0',
        foreground: '#0C0907',
        primary: '#778D5E',
        secondary: '#5d5d5d',
        muted: '#F0EFEB',
        low: '#DA7A59',
        neutral: '#E9DCBC',
        high: '#778D5E',
      },
    },
  },
  plugins: [],
} 