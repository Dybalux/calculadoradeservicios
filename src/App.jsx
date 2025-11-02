// src/App.jsx

import ServiceCalculator from './pages/ServiceCalculator'
import { Toaster } from 'react-hot-toast'
import { useTheme } from './hooks/useTheme' // Importa el hook

function App() {
  // 1. Llamamos al hook AQUÍ y obtenemos las variables
  const { theme, toggleTheme } = useTheme(); 

  return (
    // 2. El div principal usa las clases de tema (esto ya estaba bien)
    <div className="flex justify-center items-start min-h-screen w-full 
                   bg-gray-100 dark:bg-gray-900 
                   text-gray-900 dark:text-gray-100 
                   p-4 md:p-8 transition-colors duration-200"
    >
      
      {/* 3. Pasamos las variables como props al componente hijo */}
      <ServiceCalculator theme={theme} toggleTheme={toggleTheme} />

      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            border: '1px solid #4B5563',
            padding: '16px',
            color: '#F9FAFB',
            backgroundColor: '#1F2937',
          },
          light: {
            border: '1px solid #E5E7EB',
            color: '#1F2937',
            backgroundColor: '#FFFFFF',
          },
        }}
        theme="system"
      />
    </div>
  )
}

export default App