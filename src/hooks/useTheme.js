// src/hooks/useTheme.js

import { useEffect } from 'react';
import usePersistentState from './usePersistentState'; // Reutilizamos el hook que ya teníamos

export function useTheme() {
    // 1. Iniciamos el estado, leyendo la preferencia del sistema
    const [theme, setTheme] = usePersistentState('theme', 'system');

    // 2. Este efecto aplica la clase 'dark' o 'light' al <html>
    useEffect(() => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark'); // Limpiamos clases viejas

        if (theme === 'system') {
            // Si es 'system', usamos la preferencia del OS
            root.classList.add(systemPrefersDark ? 'dark' : 'light');
        } else {
            // Si no, forzamos el tema elegido
            root.classList.add(theme);
        }
    }, [theme]); // Se ejecuta cada vez que 'theme' cambia

    // 3. Creamos una función simple para alternar
    const toggleTheme = () => {
        // Cambiamos entre 'light' y 'dark'
        setTheme(prevTheme => {
            if (prevTheme === 'light') return 'dark';
            return 'light';
        });
    };

    return { theme, toggleTheme };
}