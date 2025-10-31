import { useState, useEffect } from 'react';

// Un Hook genérico para manejar estado + localStorage
function usePersistentState(key, defaultValue) {
    // Lee el valor inicial de localStorage, o usa el valor por defecto
    const [state, setState] = useState(() => {
        try {
            const savedItem = localStorage.getItem(key);
            return savedItem ? JSON.parse(savedItem) : defaultValue;
        } catch (error) {
            console.error(`Error al leer ${key} de localStorage`, error);
            return defaultValue;
        }
    });

    // Guarda en localStorage cada vez que el estado cambia
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error al guardar ${key} en localStorage`, error);
        }
    }, [key, state]); // Se ejecuta cuando 'key' o 'state' cambian

    return [state, setState];
}

export default usePersistentState;