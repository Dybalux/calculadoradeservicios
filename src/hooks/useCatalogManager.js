// src/hooks/useCatalogManager.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';

const CATALOG_SERVICES_STORAGE_KEY = 'calculator_catalog_services';

export function useCatalogManager() {
    const [catalogServices, setCatalogServices] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [catalogForm, setCatalogForm] = useState({ name: '', price: '', discount: '' });
    const [editingCatalogId, setEditingCatalogId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [confirmState, setConfirmState] = useState({ isOpen: false, idToDelete: null });

    // Cargar catálogo desde Supabase al iniciar
    useEffect(() => {
        fetchCatalog();
    }, []);

    const fetchCatalog = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setCatalogServices([]); // Si no hay usuario, lista vacía
            setLoading(false);
            return;
        }

        // Verificar si el usuario es admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = profile?.role === 'admin';

        // Si es admin, cargar TODOS los servicios; si no, solo los suyos
        let query = supabase
            .from('catalog_services')
            .select('*')
            .order('name', { ascending: true });

        if (!isAdmin) {
            query = query.eq('user_id', user.id);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error cargando catálogo:", error);
            toast.error("Error al cargar el catálogo");
        } else {
            setCatalogServices(data);
        }
        setLoading(false);
    };

    // --- FUNCIÓN DE MIGRACIÓN (De Local a Nube) ---
    const migrateLocalData = async () => {
        const localData = localStorage.getItem(CATALOG_SERVICES_STORAGE_KEY);
        if (!localData) return toast("No hay datos locales para migrar.");

        const parsedData = JSON.parse(localData);
        if (parsedData.length === 0) return toast("El catálogo local está vacío.");

        if (!confirm(`Se encontraron ${parsedData.length} servicios locales. ¿Subirlos a la nube?`)) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Inicia sesión para migrar.");

        const servicesToUpload = parsedData.map(s => ({
            name: s.name,
            price: s.price,
            discount: s.discount || 0,
            user_id: user.id
        }));

        const { error } = await supabase.from('catalog_services').insert(servicesToUpload);

        if (error) {
            toast.error("Error en la migración: " + error.message);
        } else {
            toast.success("¡Catálogo migrado con éxito!");
            localStorage.removeItem(CATALOG_SERVICES_STORAGE_KEY); // Limpiamos local
            fetchCatalog(); // Recargamos desde la nube
        }
    };

    // --- Acciones del Catálogo ---
    const toggleModal = () => {
        setShowModal(prev => !prev);
        setEditingCatalogId(null);
        setCatalogForm({ name: '', price: '', discount: '' });
    };

    const handleFormChange = (e) => {
        setCatalogForm({ ...catalogForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const price = parseFloat(catalogForm.price);
        const discount = parseFloat(catalogForm.discount) || 0;

        if (catalogForm.name.trim() === '' || isNaN(price) || price <= 0) {
            toast.error('Por favor, ingresa datos válidos.');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsSaving(false);
            return toast.error("Debes iniciar sesión.");
        }

        let error;
        if (editingCatalogId) {
            // UPDATE
            const { error: updateError } = await supabase
                .from('catalog_services')
                .update({ name: catalogForm.name.trim(), price: price, discount: discount })
                .eq('id', editingCatalogId);
            error = updateError;
        } else {
            // INSERT
            const { error: insertError } = await supabase
                .from('catalog_services')
                .insert([{
                    name: catalogForm.name.trim(),
                    price: price,
                    discount: discount,
                    user_id: user.id
                }]);
            error = insertError;
        }

        setIsSaving(false);

        if (error) {
            toast.error("Error al guardar: " + error.message);
        } else {
            setSaveSuccess(true);
            toast.success(editingCatalogId ? 'Servicio actualizado' : 'Servicio guardado');
            fetchCatalog(); // Recargar lista
            setTimeout(() => {
                setEditingCatalogId(null);
                setCatalogForm({ name: '', price: '', discount: '' });
                setSaveSuccess(false);
                // Opcional: cerrar modal automáticamente
                // setShowModal(false); 
            }, 1000);
        }
    };

    const startEdit = (service) => {
        setEditingCatalogId(service.id);
        setCatalogForm({
            name: service.name,
            price: service.price.toString(),
            discount: (service.discount || 0).toString()
        });
        // Si el modal no está abierto, abrirlo (depende de tu UX)
        if (!showModal) setShowModal(true);
    };

    const deleteItem = (idToDelete) => {
        setConfirmState({ isOpen: true, idToDelete });
    };

    const cancelDelete = () => {
        setConfirmState({ isOpen: false, idToDelete: null });
    };

    const confirmDelete = async () => {
        const { error } = await supabase
            .from('catalog_services')
            .delete()
            .eq('id', confirmState.idToDelete);

        if (error) {
            toast.error("Error al eliminar");
        } else {
            toast.success("Servicio eliminado.");
            fetchCatalog();
        }
        cancelDelete();
    };

    return {
        catalogServices,
        loading,
        modalState: {
            show: showModal,
            formState: catalogForm,
            editingId: editingCatalogId,
            isSaving: isSaving,
            saveSuccess: saveSuccess,
        },
        confirmModalState: confirmState,
        catalogActions: {
            toggleModal,
            handleFormChange,
            handleSubmit,
            startEdit,
            deleteItem,
            cancelDelete,
            confirmDelete,
            migrateLocalData, //  Exportamos la función de migración
        }
    };
}