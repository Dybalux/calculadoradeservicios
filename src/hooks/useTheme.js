import { useEffect, useState } from 'react';
import usePersistentState from './usePersistentState';

// Función helper para saber la preferencia del sistema
const getSystemPreference = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function useTheme() {
    // El estado guardado puede ser 'light', 'dark', o 'system'
    const [savedTheme, setSavedTheme] = usePersistentState('theme', 'system');
    
    // Estado interno para saber qué se está mostrando AHORA MISMO
    const [effectiveTheme, setEffectiveTheme] = useState(() => 
        savedTheme === 'system' ? getSystemPreference() : savedTheme
    );

    // Este efecto aplica la clase al <html> y actualiza el estado 'effectiveTheme'
    useEffect(() => {
        const root = window.document.documentElement;
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        root.classList.remove('light', 'dark');

        let currentTheme;
        if (savedTheme === 'system') {
            currentTheme = systemPrefersDark ? 'dark' : 'light';
        } else {
            currentTheme = savedTheme;
        }
        
        root.classList.add(currentTheme);
        setEffectiveTheme(currentTheme); // Actualizamos el estado interno

        // Opcional: Escucha cambios en el OS (si el usuario está en modo 'system')
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            if (savedTheme === 'system') {
                const newSystemTheme = e.matches ? 'dark' : 'light';
                root.classList.remove('light', 'dark');
                root.classList.add(newSystemTheme);
                setEffectiveTheme(newSystemTheme);
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);

    }, [savedTheme]); // Solo se re-ejecuta si el usuario cambia la config

    const toggleTheme = () => {
        // Al hacer toggle, basamos la decisión en el tema *efectivo* (lo que se ve)
        // y seteamos el tema a uno explícito ('light' o 'dark'), 
        // saliendo del modo 'system'.
        setSavedTheme(effectiveTheme === 'light' ? 'dark' : 'light');
    };

    // Exponemos el tema EFECTIVO para que el ícono sea correcto
    return { theme: effectiveTheme, toggleTheme };
}