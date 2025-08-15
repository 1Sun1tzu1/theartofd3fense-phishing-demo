/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          fg: 'var(--brand-fg)',
          ring: 'var(--brand-ring)'
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        }
      },
      boxShadow: {
        'soft': '0 6px 20px rgba(0,0,0,0.25)'
      }
    }
  },
  plugins: [],
}