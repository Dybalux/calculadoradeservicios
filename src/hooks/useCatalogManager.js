import { useState } from 'react';
import usePersistentState from './usePersistentState';

const CATALOG_SERVICES_STORAGE_KEY = 'calculator_catalog_services';

export function useCatalogManager() {
    const [catalogServices, setCatalogServices] = usePersistentState(CATALOG_SERVICES_STORAGE_KEY, []);
    
    // Estados del modal
    const [showModal, setShowModal] = useState(false);
    const [catalogForm, setCatalogForm] = useState({ name: '', price: '', discount: '' });
    const [editingCatalogId, setEditingCatalogId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Acciones del Catálogo ---
    const toggleModal = () => {
        setShowModal(prev => !prev);
        setEditingCatalogId(null);
        setCatalogForm({ name: '', price: '', discount: '' });
    };

    const handleFormChange = (e) => {
        setCatalogForm({ ...catalogForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const price = parseFloat(catalogForm.price);
        const discount = parseFloat(catalogForm.discount) || 0;

        if (catalogForm.name.trim() === '' || isNaN(price) || price <= 0) {
            alert('Por favor, ingresa un nombre y precio válido.');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        setTimeout(() => {
            if (editingCatalogId) {
                setCatalogServices(prevCatalog => 
                    prevCatalog.map(s =>
                        s.id === editingCatalogId
                            ? { ...s, name: catalogForm.name.trim(), price: price, discount: discount }
                            : s
                    )
                );
            } else {
                const newCatalogService = {
                    id: Date.now(),
                    name: catalogForm.name.trim(),
                    price: price,
                    discount: discount
                };
                setCatalogServices(prevCatalog => [...prevCatalog, newCatalogService]);
            }
            
            setEditingCatalogId(null);
            setCatalogForm({ name: '', price: '', discount: '' });
            setIsSaving(false);
            setSaveSuccess(true);
            
            setTimeout(() => {
                setSaveSuccess(false);
            }, 1500);

        }, 1000);
    };

    const startEdit = (service) => {
        setEditingCatalogId(service.id);
        setCatalogForm({
            name: service.name,
            price: service.price.toString(),
            discount: (service.discount || 0).toString()
        });
    };

    const deleteItem = (idToDelete) => {
        if (window.confirm('¿Seguro que quieres eliminar este servicio de tu catálogo?')) {
            setCatalogServices(prevCatalog => prevCatalog.filter(s => s.id !== idToDelete));
        }
    };

    return {
        catalogServices,
        modalState: {
            show: showModal,
            formState: catalogForm,
            editingId: editingCatalogId,
            isSaving: isSaving,
            saveSuccess: saveSuccess,
        },
        catalogActions: {
            toggleModal,
            handleFormChange,
            handleSubmit,
            startEdit,
            deleteItem,
        }
    };
}