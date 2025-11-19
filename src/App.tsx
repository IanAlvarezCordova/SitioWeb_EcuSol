import AppRouter from '@/routes/AppRouter'
import { Toaster } from 'react-hot-toast'; // <--- IMPORTAR ESTO

function App() {
  return (
    <>
      <AppRouter />
      {/* ESTE ES EL COMPONENTE QUE MUESTRA LAS ALERTAS */}
      <Toaster 
         position="top-center"
         reverseOrder={false}
         toastOptions={{
           duration: 4000,
           style: {
             background: '#333',
             color: '#fff',
           },
         }}
      />
    </>
  )
}

export default App