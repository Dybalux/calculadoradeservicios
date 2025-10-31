import { useState } from 'react';
import usePersistentState from './usePersistentState';

const ISSUER_STORAGE_KEY = 'calculator_issuer_data';

// La función para inicializar los datos del emisor
const getInitialIssuerData = () => {
    try {
        const savedIssuer = localStorage.getItem(ISSUER_STORAGE_KEY);
        const parsedIssuer = savedIssuer ? JSON.parse(savedIssuer) : {};
        return {
            name: '',
            company: '',
            email: '',
            paymentMethods: '',
            ...parsedIssuer
        };
    } catch (error) {
        console.error("Error al cargar datos del emisor", error);
        return { name: '', company: '', email: '', paymentMethods: '' };
    }
};

export function useQuoteData() {
    // Los datos del cliente no son persistentes (se resetean)
    const [clientData, setClientData] = useState({
        name: '',
        company: '',
        email: ''
    });

    // Los datos del emisor sí son persistentes
    const [issuerData, setIssuerData] = usePersistentState(
        ISSUER_STORAGE_KEY,
        getInitialIssuerData() // Llama a la función para obtener el valor inicial
    );

    // Funciones "handler" que pasaremos a los componentes
    const handleClientChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleIssuerChange = (e) => {
        setIssuerData({ ...issuerData, [e.target.name]: e.target.value });
    };

    return {
        clientData,
        issuerData,
        handleClientChange,
        handleIssuerChange,
    };
}