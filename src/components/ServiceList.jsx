// src/components/ServiceList.jsx

import React from 'react';
import ServiceListItem from './ServiceListItem'; // Importamos el componente de la fila

// --- Estilos de Tailwind ---
const styles = {
    listTitle: "border-b border-gray-700 pb-2 mt-5 text-xl font-semibold text-white",
    serviceList: "list-none p-0 min-h-[50px]", // min-h-[50px] reemplaza minHeight
};

// --- 👇 Props CORREGIDAS ---
function ServiceList({
    services,
    editingId,
    editForm, // Recibimos el objeto del formulario de edición
    setEditForm, // Recibimos el setter del formulario de edición
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDeleteService
}) {

    // Creamos un handler unificado para los inputs de edición
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <h3 className={styles.listTitle}>Servicios Agregados:</h3>
            <ul className={styles.serviceList}>
                {services.map((service) => (
                    <ServiceListItem
                        key={service.id}
                        service={service}
                        editingId={editingId}
                        // --- 👇 Pasamos las props corregidas ---
                        editForm={editForm}
                        onEditFormChange={handleEditFormChange}
                        // --- Pasamos las acciones ---
                        onSaveEdit={onSaveEdit}
                        onCancelEdit={onCancelEdit}
                        onEditClick={onEditClick}
                        onDeleteService={onDeleteService}
                    />
                ))}
            </ul>
        </>
    );
}

export default ServiceList;