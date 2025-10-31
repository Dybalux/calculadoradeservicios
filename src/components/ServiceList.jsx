// src/components/ServiceList.jsx

import React from 'react';
import ServiceListItem from './ServiceListItem'; // Importamos el componente de la fila

// Estilos que movimos desde ServiceCalculator
const styles = {
    listTitle: {
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        marginTop: '20px'
    },
    serviceList: {
        listStyleType: 'none',
        padding: 0,
        minHeight: '50px' // Evita que salte la UI
    },
};

// Este componente actúa como un "pasamanos" de props.
// Recibe todas las props del padre (ServiceCalculator)
// y las pasa al hijo (ServiceListItem).
function ServiceList({
    services,
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
    return (
        <>
            <h3 style={styles.listTitle}>Servicios Agregados:</h3>
            <ul style={styles.serviceList}>
                {services.map((service) => (
                    // Por cada servicio, renderiza un ServiceListItem
                    // y le pasa todas las props que necesita
                    <ServiceListItem
                        key={service.id}
                        service={service}
                        editingId={editingId}
                        editName={editName}
                        setEditName={setEditName}
                        editPrice={editPrice}
                        setEditPrice={setEditPrice}
                        editQuantity={editQuantity}
                        setEditQuantity={setEditQuantity}
                        editDiscount={editDiscount}
                        setEditDiscount={setEditDiscount}
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