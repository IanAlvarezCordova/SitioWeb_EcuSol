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
          primario: '#003366',    // Azul oscuro serio (Banco)
          secundario: '#D4AF37',  // Dorado elegante
          acento: '#F4F7FA',      // Blanco/Gris azulado para fondos
          texto: '#1A1A1A',       // Negro suave
          rojo: '#D32F2F',        // Errores
          verde: '#388E3C'        // Éxito
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fuente limpia
      }
    },
  },
  plugins: [],
}