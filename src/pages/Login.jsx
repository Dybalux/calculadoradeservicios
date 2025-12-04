import { useState } from 'react';
import { supabase } from '../supabase/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Login() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Usamos Magic Link para empezar (es más fácil, te llega un mail para entrar)
        // O si prefieres contraseña, avísame y cambiamos el código.
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // IMPORTANTE: Asegúrate que esta URL coincida con tu base en vite.config.js
                emailRedirectTo: window.location.origin + '/servicios/eventos',
            },
        });

        if (error) {
            toast.error('Error al iniciar sesión: ' + error.message);
        } else {
            toast.success('¡Enlace mágico enviado! Revisa tu correo.');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                    Ingresar a la Agenda
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Te enviaremos un enlace mágico a tu correo para entrar sin contraseña.
                </p>
            </div>
        </div>
    );
}

export default Login;