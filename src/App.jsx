// src/App.jsx
import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import ServiceCalculator from './pages/ServiceCalculator';
import Agenda from './pages/Agenda';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';
import { supabase } from './supabase/client'; // 👈 Importamos cliente Supabase

function App() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null); // Estado para el usuario

  // 👇 Efecto para escuchar el estado de la sesión
  useEffect(() => {
    // 1. Verificamos si ya hay sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Escuchamos cambios (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter basename="/calculadoradeservicios/">
      <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 transition-colors duration-200 font-sans">

        {/* --- BARRA DE NAVEGACIÓN --- */}
        <nav className="bg-white dark:bg-gray-800 shadow-md p-4 mb-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

            {/* Links de Navegación */}
            <div className="flex gap-6 items-center">
              <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors">
                Calculadora
              </Link>
              <Link to="/agenda" className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors">
                Agenda
              </Link>
            </div>

            {/* Área de Usuario y Tema */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Ingresar
                </Link>
              )}

              {/* Botón de Tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Cambiar tema"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </nav>

        {/* --- CONTENIDO DE LAS PÁGINAS --- */}
        <div className="flex justify-center items-start p-4">
          <Routes>
            <Route path="/" element={<ServiceCalculator theme={theme} toggleTheme={toggleTheme} />} />
            <Route path="/agenda" element={<Agenda />} />

            {/* Si ya está logueado, /login te manda a /agenda */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/agenda" replace />}
            />

            {/* Ruta Comodín: Si la URL no existe, manda al inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        <Toaster position="bottom-right" theme="system" />
      </div>
    </BrowserRouter>
  );
}

export default App;