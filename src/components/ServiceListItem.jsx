// src/components/ServiceListItem.jsx

import React from 'react';

// --- Estilos migrados a Tailwind ---
const styles = {
    serviceItem: "flex items-center gap-2 py-2.5 px-1 border-b border-gray-700",
    discountBadge: "bg-green-600 text-white text-xs font-bold ml-2 px-1.5 py-0.5 rounded-full",
    
    // Clases para los inputs de edición
    editInput: "flex-1 p-1.5 rounded-md bg-gray-700 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0",
    editInputSmall: "p-1.5 rounded-md bg-gray-700 text-white border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0",
    
    // Clases para los botones
    editButton: "bg-yellow-500 text-black px-2 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors",
    deleteButton: "bg-red-600 text-white px-2 py-1.5 rounded-md text-sm font-medium ml-2 hover:bg-red-700 transition-colors",
    saveButton: "bg-green-600 text-white px-2 py-1.5 rounded-md text-sm font-medium hover:bg-green-700 transition-colors",
    cancelButton: "bg-gray-600 text-white px-2 py-1.5 rounded-md text-sm font-medium ml-2 hover:bg-gray-700 transition-colors",
};


// --- 👇 Props CORREGIDAS ---
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
                // --- Modo Edición (con props y clases corregidas) ---
                <>
                    <input
                        type="text"
                        name="name" // Se usa en onEditFormChange
                        value={editForm.name}
                        onChange={onEditFormChange}
                        className={`${styles.editInput} flex-[2]`}
                    />
                    <input
                        type="number"
                        name="quantity" // Se usa en onEditFormChange
                        min="1"
                        step="1"
                        value={editForm.quantity}
                        onChange={onEditFormChange}
                        className={`${styles.editInputSmall} w-[50px]`}
                    />
                    <input
                        type="number"
                        name="price" // Se usa en onEditFormChange
                        min="0.01"
                        step="0.01"
                        value={editForm.price}
                        onChange={onEditFormChange}
                        className={`${styles.editInputSmall} w-[70px]`}
                    />
                    <input
                        type="number"
                        name="discount" // Se usa en onEditFormChange
                        min="0"
                        max="100"
                        placeholder="%"
                        value={editForm.discount}
                        onChange={onEditFormChange}
                        className={`${styles.editInputSmall} w-[50px]`}
                    />
                    <button onClick={() => onSaveEdit(service.id)} className={styles.saveButton}>Guardar</button>
                    <button onClick={onCancelEdit} className={styles.cancelButton}>X</button>
                </>
            ) : (
                // --- Modo Visualización (con clases de Tailwind) ---
                <>
                    <span className="flex-1 text-white truncate" title={service.name}>
                        {service.name} (x{service.quantity})
                        {(service.discount || 0) > 0 && (
                            <span className={styles.discountBadge}>-{service.discount}%</span>
                        )}
                    </span>
                    <span className="w-[100px] text-right font-bold text-white">
                        ${((service.price * service.quantity) * (1 - (service.discount || 0) / 100)).toFixed(2)}
                    </span>
                    <div className="ml-2.5 flex-shrink-0">
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