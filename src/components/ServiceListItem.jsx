// src/components/ServiceListItem.jsx

import React from 'react';

// Estilos que movimos desde ServiceCalculator
const styles = {
    serviceItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 5px',
        borderBottom: '1px solid #f0f0f0',
        gap: '5px',
    },
    discountBadge: {
        backgroundColor: '#28a745',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '10px',
        fontSize: '10px',
        marginLeft: '8px',
        fontWeight: 'bold',
    },
    editInput: {
        flex: '1',
        padding: '6px',
        border: '1px solid #007bff',
        borderRadius: '4px',
        minWidth: 0,
    },
    editInputPrice: {
        width: '80px',
        padding: '6px',
        border: '1px solid #007bff',
        borderRadius: '4px',
    },
    editButton: {
        backgroundColor: '#ffc107',
        color: 'black',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
        marginLeft: '5px',
    },
    saveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
        marginLeft: '5px',
    },
};

// Este componente recibe MUCHAS props, porque toda la lógica
// y el estado de "edición" todavía viven en el componente padre.
function ServiceListItem({
    service,
    editingId,
    editName, setEditName,
    editPrice, setEditPrice,
    editQuantity, setEditQuantity,
    editDiscount, setEditDiscount,
    onSaveEdit,
    onCancelEdit,
    onEditClick,
    onDeleteService
}) {

    const isEditing = editingId === service.id;

    return (
        <li 
            key={service.id} 
            style={{ 
                ...styles.serviceItem, 
                justifyContent: isEditing ? 'flex-start' : 'space-between' 
            }}
        >
            {isEditing ? (
                // --- Modo Edición ---
                <>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...styles.editInput, flex: 2 }} />
                    <input type="number" min="1" step="1" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                    <input type="number" min="0.01" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ ...styles.editInputPrice, width: '70px' }} />
                    <input type="number" min="0" max="100" placeholder="%" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                    <button onClick={() => onSaveEdit(service.id)} style={styles.saveButton}>Guardar</button>
                    <button onClick={onCancelEdit} style={styles.cancelButton}>X</button>
                </>
            ) : (
                // --- Modo Visualización ---
                <>
                    <span style={{ flex: 1 }}>
                        {service.name} (x{service.quantity})
                        {(service.discount || 0) > 0 && (
                            <span style={styles.discountBadge}>-{service.discount}%</span>
                        )}
                    </span>
                    <span style={{ width: '100px', textAlign: 'right' }}>
                        <strong>${((service.price * service.quantity) * (1 - (service.discount || 0) / 100)).toFixed(2)}</strong>
                    </span>
                    <div style={{ marginLeft: '10px' }}>
                        <button onClick={() => onEditClick(service)} style={styles.editButton}>
                            Editar
                        </button>
                        <button onClick={() => onDeleteService(service.id)} style={styles.deleteButton}>
                            Eliminar
                        </button>
                    </div>
                </>
            )}
        </li>
    );
}

export default ServiceListItem;