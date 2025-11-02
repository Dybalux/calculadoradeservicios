// src/components/ServiceListItem.jsx

import React from 'react';

// Clases de Tailwind (actualizadas con dark:)
const styles = {
    serviceItem: "flex flex-wrap items-center gap-2 py-3 px-1 border-b border-gray-200 dark:border-gray-700",
    discountBadge: "bg-green-600 text-white text-xs font-bold ml-2 px-1.5 py-0.5 rounded-full",
    
    // Inputs de edición
    editInput: "p-1.5 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
    
    // Botones
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
                // --- Modo Edición (con anchos corregidos) ---
                <>
                    <input
                        type="text"
                        name="name" 
                        value={editForm.name}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-full sm:w-4/12`} 
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        value={editForm.quantity}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(33%-4px)] sm:w-2/12`}
                    />
                    <input
                        type="number"
                        name="price"
                        min="0.01"
                        step="0.01"
                        value={editForm.price}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(33%-4px)] sm:w-3/12`}
                    />
                    <input
                        type="number"
                        name="discount"
                        min="0"
                        max="100"
                        placeholder="%"
                        value={editForm.discount}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} w-[calc(33%-4px)] sm:w-2/12`}
                    />
                    <div className="w-full sm:w-auto flex justify-end gap-2 mt-2 sm:mt-0">
                        <button onClick={() => onSaveEdit(service.id)} className={styles.saveButton}>G</button>
                        <button onClick={onCancelEdit} className={styles.cancelButton}>X</button>
                    </div>
                </>
            ) : (
                // --- Modo Visualización ---
                <>
                    <span className="flex-1 text-gray-800 dark:text-gray-100 truncate" title={service.name}>
                        {service.name} (x{service.quantity})
                        {(service.discount || 0) > 0 && (
                            <span className={styles.discountBadge}>-{service.discount}%</span>
                        )}
                    </span>
                    <span className="w-[100px] text-right font-bold text-gray-900 dark:text-white">
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