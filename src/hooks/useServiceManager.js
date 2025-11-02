import { useState } from 'react';
import usePersistentState from './usePersistentState';
import toast from 'react-hot-toast';

const SERVICES_STORAGE_KEY = 'calculator_services';

export function useServiceManager() {
    const [services, setServices] = usePersistentState(SERVICES_STORAGE_KEY, []);

    // Estado para la fila que se está editando
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        price: '',
        quantity: 1,
        discount: ''
    });

    // --- Acciones ---

    const addService = (serviceToAdd) => {
        const price = parseFloat(serviceToAdd.price);
        const quantity = parseInt(serviceToAdd.quantity, 10);
        const discount = parseFloat(serviceToAdd.discount) || 0;

        if (serviceToAdd.name.trim() === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            toast.error('Nombre, precio y cantidad deben ser positivos.'); return false; // Indica que falló
        }

        const newService = {
            id: Date.now(),
            name: serviceToAdd.name.trim(),
            price: price,
            quantity: quantity,
            discount: discount
        };

        setServices(prevServices => [...prevServices, newService]);
        toast.success(`"${newService.name.trim()}" agregado.`);
        return true; // Indica que fue exitoso
    };

    const deleteService = (idToDelete) => {
        const serviceToDelete = services.find(s => s.id === idToDelete);
        if (serviceToDelete) {
            toast.error(`"${serviceToDelete.name}" eliminado.`);
        }
        setServices(prevServices => prevServices.filter(service => service.id !== idToDelete));
    };

    const startEdit = (service) => {
        setEditingId(service.id);
        setEditForm({
            name: service.name,
            price: service.price.toString(),
            quantity: service.quantity.toString(),
            discount: (service.discount || 0).toString()
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = (idToSave) => {
        const price = parseFloat(editForm.price);
        const quantity = parseInt(editForm.quantity, 10);
        const discount = parseFloat(editForm.discount) || 0;

        if (editForm.name.trim() === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            toast.error('Nombre, precio y cantidad deben ser positivos.');
            return;
        }

        const updatedServices = services.map(service => {
            if (service.id === idToSave) {
                return { ...service, name: editForm.name.trim(), price: price, quantity: quantity, discount: discount };
            }
            return service;
        });

        setServices(updatedServices);
        setEditingId(null);
        toast.success(`"${editForm.name.trim()}" actualizado.`);
    };

    const total = services.reduce((accumulator, service) => {
        const discount = service.discount || 0;
        const baseSubtotal = service.price * service.quantity;
        const discountAmount = baseSubtotal * (discount / 100);
        const finalSubtotal = baseSubtotal - discountAmount;
        return accumulator + finalSubtotal;
    }, 0);

    return {
        services,
        total,
        editingId,
        editForm,
        setEditForm,
        actions: {
            addService,
            deleteService,
            startEdit,
            cancelEdit,
            saveEdit,
        }
    };
}