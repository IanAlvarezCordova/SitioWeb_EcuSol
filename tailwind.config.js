/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ecusol: {
          primario: '#003366',    // Azul oscuro
          secundario: '#D4AF37',  // Dorado
          acento: '#F4F7FA',      // Blanco azulado
          texto: '#1A1A1A',       // Negro suave
          rojo: '#D32F2F',
          verde: '#388E3C',
          
          // AGREGADOS PARA SOLUCIONAR TU ERROR:
          'gris-claro': '#F3F4F6', // Gris muy suave para fondos
          'gris-oscuro': '#374151' // Gris oscuro para textos secundarios
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}