import { createClient } from '@supabase/supabase-js';

// Usar variables de entorno con fallback a valores hardcodeados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tiipoizdtzvwmjrxowra.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpaXBvaXpkdHp2d21qcnhvd3JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODIzMDYsImV4cCI6MjA4MDM1ODMwNn0.QbN8sv76Fw4DhdCrcQAVehTg_oXgyW2in1WU3H_uHVY';

// Detectar el entorno y configurar la URL de redirección correcta
const getRedirectUrl = () => {
    // Si estamos en desarrollo (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return `http://localhost:${window.location.port}`;
    }
    // Si estamos en producción (GitHub Pages)
    return 'https://dybalux.github.io/servicios/';
};

// Validación de variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase configuration missing!');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    throw new Error(
        'Missing Supabase environment variables. ' +
        'Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in GitHub Secrets.'
    );
}

// Crear cliente de Supabase con configuración de redirección
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        redirectTo: getRedirectUrl(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Log para debugging (solo en desarrollo)
if (import.meta.env.DEV) {
    console.log('🔧 Supabase redirect URL:', getRedirectUrl());
}