// src/components/ServiceListItem.jsx

import React from 'react';

// Clases de Tailwind
const styles = {
    serviceItem: "flex flex-wrap items-center gap-2 py-3 px-1 border-b border-gray-200",
    discountBadge: "bg-green-600 text-white text-xs font-bold ml-2 px-1.5 py-0.5 rounded-full",
    
    // Clases para los inputs de edición (responsivos)
    editInput: "p-1.5 rounded-md bg-white text-gray-900 border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
    
    // Clases para los botones
    editButton: "bg-yellow-500 text-black px-2 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors",
    deleteButton: "bg-red-600 text-white px-2 py-1.5 rounded-md text-sm font-medium ml-2 hover:bg-red-700 transition-colors",
    saveButton: "bg-green-600 text-white px-2 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors",
    cancelButton: "bg-gray-500 text-white px-2 py-1.5 rounded-md text-sm font-medium ml-2 hover:bg-gray-600 transition-colors",
};


function ServiceListItem({
    service,
    editingId,
    editForm,
    onEditFormChange,
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDeleteService
}) {

    const isEditing = editingId === service.id;

    return (
        <li
            key={service.id}
            className={`${styles.serviceItem} ${isEditing ? 'justify-start' : 'justify-between'}`}
        >
            {isEditing ? (
                // --- Modo Edición Responsivo ---
                <>
                    <input
                        type="text"
                        name="name" 
                        value={editForm.name}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-full md:w-4/12`} // Ancho completo en mobile
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        value={editForm.quantity}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(50%-4px)] md:w-2/12`} // Mitad de ancho en mobile
                    />
                    <input
                        type="number"
                        name="price"
                        min="0.01"
                        step="0.01"
                        value={editForm.price}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(50%-4px)] md:w-3/12`} // Mitad de ancho en mobile
                    />
                    <input
                        type="number"
                        name="discount"
                        min="0"
                        max="100"
                        placeholder="%"
                        value={editForm.discount}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(50%-4px)] md:w-2/12`} // Mitad de ancho en mobile
                    />
                    {/* Botones (el 'auto' hace que se pongan a la derecha) */}
                    <div className="w-full md:w-auto flex justify-end gap-2 mt-2 md:mt-0">
                        <button onClick={() => onSaveEdit(service.id)} className={styles.saveButton}>Guardar</button>
                        <button onClick={onCancelEdit} className={styles.cancelButton}>X</button>
                    </div>
                </>
            ) : (
                // --- Modo Visualización ---
                <>
                    <span className="flex-1 text-gray-800 truncate" title={service.name}>
                        {service.name} (x{service.quantity})
                        {(service.discount || 0) > 0 && (
                            <span className={styles.discountBadge}>-{service.discount}%</span>
                        )}
                    </span>
                    <span className="w-[100px] text-right font-bold text-gray-900">
                        ${((service.price * service.quantity) * (1 - (service.discount || 0) / 100)).toFixed(2)}
                    </span>
                    <div className="ml-2.5 shrink-0">
                        <button onClick={() => onEditClick(service)} className={styles.editButton}>
                            Editar
                        </button>
                        <button onClick={() => onDeleteService(service.id)} className={styles.deleteButton}>
                            Eliminar
                        </button>
                    </div>
                </>
            )}
        </li>
    );
}

export default ServiceListItem;