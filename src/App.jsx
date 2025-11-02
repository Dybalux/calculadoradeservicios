// src/App.jsx

import ServiceCalculator from './pages/ServiceCalculator'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './hooks/useTheme' // <-- 1. Importa el hook

function App() {
  // 2. Llama al hook (esto aplica la clase 'dark' o 'light' al <html>)
  useTheme(); 

  return (
    // 3. Aplicamos clases para AMBOS modos
    <div className="flex justify-center items-start min-h-screen w-full 
                   bg-gray-100 dark:bg-gray-900 
                   text-gray-900 dark:text-gray-100 
                   p-4 md:p-8 transition-colors duration-200"
    >
      
      <ServiceCalculator />

      {/* 4. Actualizamos el Toaster para que responda al tema */}
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          // Estilo base (oscuro)
          style: {
            border: '1px solid #4B5563', // gray-600
            padding: '16px',
            color: '#F9FAFB', // gray-50
            backgroundColor: '#1F2937', // gray-800
          },
          // Estilo para modo claro
          light: {
            border: '1px solid #E5E7EB', // gray-200
            color: '#1F2937', // gray-800
            backgroundColor: '#FFFFFF', // white
          },
        }}
        // El hook 'useTheme' añade 'dark' o 'light' al <html>,
        // pero necesitamos un truco para que Toaster lo "vea".
        // La forma más fácil es dejar que Toaster use el tema del sistema.
        theme="system"
      />
    </div>
  )
}

export default App