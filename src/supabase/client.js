import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)