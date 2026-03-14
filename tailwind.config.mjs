/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/styles/global.css', // Añadido para asegurar que Tailwind escanee este archivo
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de marca: colores proporcionados (# / CMYK / RGB)
        primary: '#d5eef1', // Fondo principal (muy claro cyan)
        secondary: '#1A1F1C', // Oscuro para nav, textos y contraste
        accent: '#c3952e', // Dorado marca (CTAs, acentos)
        // Colores de la guía
        sky: '#9fdae7',   // Cyan claro
        ice: '#d5eef1',   // Cyan muy claro (= primary)
        stone: '#bebdbc', // Gris neutro
        sand: '#e3d7ac', // Beige/tan
        gold: {
          light: '#fde483',
          DEFAULT: '#c3952e',
          bright: '#fde25c',
          mid: '#d5ae30',
          dark: '#ba852c',
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
          700: '#706459',
          800: '#554d44',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdfbf7',
          200: '#faf6ef',
          300: '#f5efe4',
          400: '#ebe2d4',
        },
        eucalyptus: {
          50: '#e8eeeb',
          100: '#d1ddd7',
          200: '#a3bbb3',
          300: '#6b8f82',
          400: '#4a6b5f',
          500: '#3d594f',
          600: '#324840',
        },
        brandGold: '#c3952e', // Alias del dorado de marca (accent)
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
