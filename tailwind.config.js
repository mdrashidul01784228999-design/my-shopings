/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slot-blur': {
          '0%': { transform: 'translateY(-100%)', filter: 'blur(0px)' },
          '50%': { filter: 'blur(8px)' },
          '100%': { transform: 'translateY(100%)', filter: 'blur(0px)' },
        },
        'coin-fall': {
          '0%': { transform: 'translateY(-100px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(400px) rotate(360deg)', opacity: '0' }
        }
      },
      animation: {
        'slot-blur': 'slot-blur 0.15s infinite linear',
        'coin-fall': 'coin-fall 1s ease-in forwards',
      }
    },
  },
  plugins: [],
}