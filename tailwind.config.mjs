/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/styles/global.css', // Añadido para asegurar que Tailwind escanee este archivo
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de lujo: beige, crema, verde eucalipto, dorado apagado
        primary: '#fefdfb', // Fondo principal muy claro (antes #F5F5F0)
        secondary: '#1C2B22', // Verde bosque profundo para textos / bloques oscuros
        accent: '#b8956e', // Nude/arena para botones y detalles (antes dorado)
        stone: '#bebdbc', // Gris neutro
        sand: '#e3d7ac', // Beige/tan
        gold: {
          50: '#f9f7f2',
          100: '#f0ebe0',
          200: '#e2d6c4',
          300: '#cfbc9e',
          400: '#b89d75',
          500: '#a0865c',
          600: '#8b7049',
          light: '#d4c4a8',
          DEFAULT: '#b8956e',
          bright: '#c4a77d',
          mid: '#a8865e',
          dark: '#8b7049',
        },
        // Escalas para compatibilidad con componentes existentes
        beige: {
          50: '#faf8f6',
          100: '#f5f1eb',
          200: '#e8e2d8',
          300: '#d9d0c2',
          400: '#c4b8a8',
          500: '#a89885',
          600: '#8b7d6e',
          700: '#706459', // Tono más oscuro para texto
          800: '#554d44', // Tono aún más oscuro para títulos
        },
        cream: {
          50: '#fefdfb',
          100: '#fdfbf7',
          200: '#faf6ef',
          300: '#f5efe4',
          400: '#ebe2d4',
        },
        eucalyptus: {
          50: '#f0f5f2',
          100: '#e1ebe5',
          200: '#c5d9cc',
          300: '#9fbfae',
          400: '#7aa392',
          500: '#5c8776',
          600: '#486d5f',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
        script: ['Tahu', '"Dancing Script"', 'cursive'], // Tahu desde public/fonts/Tahu-Regular.ttf
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      borderRadius: {
        'spa': '0.5rem',
        'spa-lg': '0.75rem',
        'spa-xl': '1rem',
      },
      boxShadow: {
        'spa': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'spa-md': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'spa-soft': '0 2px 8px -2px rgb(0 0 0 / 0.06), 0 4px 16px -4px rgb(0 0 0 / 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
