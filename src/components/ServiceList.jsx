import React from 'react';
import ServiceListItem from './ServiceListItem';

// Clases de Tailwind (actualizadas con dark:)
const styles = {
    listTitle: "border-b border-gray-200 dark:border-gray-700 pb-2 mt-5 text-xl font-bold text-gray-800 dark:text-white",
    serviceList: "list-none p-0 min-h-[50px]",
};

function ServiceList({
    services,
    editingId,
    editForm, 
    setEditForm,
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDeleteService
}) {

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <h3 className={styles.listTitle}>Servicios Agregados:</h3>
            <ul className={styles.serviceList}>
                {services.length === 0 && (
                    <li className="text-gray-500 dark:text-gray-400 text-center py-4">No hay servicios agregados.</li>
                )}
                {services.map((service) => (
                    <ServiceListItem
                        key={service.id}
                        service={service}
                        editingId={editingId}
                        editForm={editForm}
                        onEditFormChange={handleEditFormChange}
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