import ServiceCalculator from './pages/ServiceCalculator'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    // Aplicamos las clases de Tailwind para el fondo oscuro,
    // el centrado y el padding (espaciado).
    <div className="flex justify-center items-start min-h-screen w-full bg-gray-900 text-gray-200 p-4 md:p-8">
      <ServiceCalculator />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: '',
          style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#FFFFFF',
            backgroundColor: '#282c34',
          },
        }}
      />
    </div>
  )
}

export default App