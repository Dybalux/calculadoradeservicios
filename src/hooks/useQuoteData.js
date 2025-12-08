import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const ISSUER_STORAGE_KEY = 'calculator_issuer_data';

export function useQuoteData() {
    // Datos del Cliente
    const [clientData, setClientData] = useState({
        name: '',
        company: '',
        phone: ''
    });

    // Datos del Emisor (Sin email)
    const [issuerData, setIssuerData] = useState({
        name: '',
        company: '',
        phone: '',
        paymentMethods: ''
    });

    const [loadingIssuer, setLoadingIssuer] = useState(true);
    const saveTimeoutRef = useRef(null);

    // CARGAR DATOS AL INICIO 
    useEffect(() => {
        fetchIssuerData();
    }, []);

    const fetchIssuerData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const local = localStorage.getItem(ISSUER_STORAGE_KEY);
            if (local) setIssuerData(JSON.parse(local));
            setLoadingIssuer(false);
            return;
        }

        const { data, error } = await supabase
            .from('issuer_info')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setIssuerData({
                name: data.name || '',
                company: data.company || '',
                // email: data.email || '', <-- ELIMINADO
                phone: data.phone || '',
                paymentMethods: data.payment_methods || ''
            });
        } else {
            const local = localStorage.getItem(ISSUER_STORAGE_KEY);
            if (local) {
                const parsedLocal = JSON.parse(local);
                // Nos aseguramos de borrar el email si venía del local viejo
                const { email, ...cleanData } = parsedLocal;
                setIssuerData(cleanData);
                saveToCloud(cleanData, user.id);
                toast.success("Datos migrados (sin email).");
            }
        }
        setLoadingIssuer(false);
    };

    // --- GUARDAR EN LA NUBE ---
    const saveToCloud = async (dataToSave, userId) => {
        const payload = {
            user_id: userId,
            name: dataToSave.name,
            company: dataToSave.company,
            // email: dataToSave.email, <-- ELIMINADO
            phone: dataToSave.phone,
            payment_methods: dataToSave.paymentMethods
        };

        const { error } = await supabase
            .from('issuer_info')
            .upsert(payload);

        if (error) console.error("Error guardando emisor:", error);
    };

    // --- HANDLERS ---
    const handleClientChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleIssuerChange = (e) => {
        const { name, value } = e.target;
        const newData = { ...issuerData, [name]: value };

        setIssuerData(newData);
        localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(newData));

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await saveToCloud(newData, user.id);
            }
        }, 1500);
    };

    const clearClientData = () => {
        setClientData({ name: '', company: '', phone: '' });
    };

    return {
        clientData,
        issuerData,
        handleClientChange,
        handleIssuerChange,
        clearClientData,
        loadingIssuer
    };
}