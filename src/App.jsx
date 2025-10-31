import ServiceCalculator from './pages/ServiceCalculator'

function App() {
  return (
    // Aplicamos las clases de Tailwind para el fondo oscuro,
    // el centrado y el padding (espaciado).
    <div className="flex justify-center items-start min-h-screen w-full bg-gray-900 text-gray-200 p-4 md:p-8">
      <ServiceCalculator />
    </div>
  )
}

export default App