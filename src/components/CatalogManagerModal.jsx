import React from 'react';

// --- Estilos ---
// Movimos todos los estilos del modal y el catálogo aquí
const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        color: '#213547', // Arregla el texto invisible
    },
    catalogForm: {
        display: 'block',
        marginBottom: '20px',
    },
    modalInputGroup: {
        marginBottom: '15px',
    },
    modalLabel: {
        display: 'block',
        fontWeight: 'bold',
        marginBottom: '5px',
        fontSize: '14px',
        color: '#333333',
    },
    modalInput: {
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minWidth: 0,
        backgroundColor: '#ffffff',
        color: '#213547',
        width: '100%',
        boxSizing: 'border-box',
    },
    listTitle: {
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        marginTop: '20px',
        color: '#213547', // Asegura color de texto
    },
    catalogList: {
        listStyleType: 'none',
        padding: 0,
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #eee',
        borderRadius: '4px',
    },
    serviceItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 5px',
        borderBottom: '1px solid #f0f0f0',
        gap: '5px',
    },
    closeButton: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginTop: '20px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    buttonLoading: {
        width: '100%',
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        backgroundColor: '#ff9900',
        cursor: 'wait',
        boxSizing: 'border-box',
    },
    buttonSuccess: {
        width: '100%',
        padding: '10px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#28a745',
        boxSizing: 'border-box',
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '3px solid rgba(255,255,255,.3)',
        borderRadius: '50%',
        borderTopColor: '#ffffff',
        animation: 'spin 1s linear infinite',
        marginRight: '8px',
        verticalAlign: 'middle',
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
};

// Este es el componente "hijo". Recibe todo como props.
function CatalogManagerModal({
    show, // El booleano que lo muestra u oculta
    onClose, // La función que se llama al cerrar
    onSubmit, // La función que se llama al guardar
    onFormChange, // El handler para los inputs
    formState, // El objeto { name, price, discount }
    catalogServices, // El array de servicios guardados
    onEditClick, // La función para editar
    onDeleteClick, // La función para borrar
    editingId, // El ID del servicio que se está editando
    isSaving, // Booleano para el estado "Editando..."
    saveSuccess // Booleano para el estado "¡Guardado!"
}) {

    // Si 'show' es falso, no renderiza nada
    if (!show) {
        return null;
    }

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2>Administrar Catálogo de Servicios</h2>

                {/* Formulario de Carga/Edición */}
                <form onSubmit={onSubmit} style={styles.catalogForm}>

                    <div style={styles.modalInputGroup}>
                        <label htmlFor="catalog_name" style={styles.modalLabel}>
                            Nombre del Servicio:
                        </label>
                        <input
                            id="catalog_name"
                            name="name"
                            placeholder="Ej: Diseño de Logo"
                            value={formState.name}
                            onChange={onFormChange}
                            style={styles.modalInput}
                        />
                    </div>

                    <div style={styles.modalInputGroup}>
                        <label htmlFor="catalog_price" style={styles.modalLabel}>
                            Precio Base ($):
                        </label>
                        <input
                            id="catalog_price"
                            name="price"
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Ej: 1500"
                            value={formState.price}
                            onChange={onFormChange}
                            style={styles.modalInput}
                        />
                    </div>

                    <div style={styles.modalInputGroup}>
                        <label htmlFor="catalog_discount" style={styles.modalLabel}>
                            Descuento (% Opcional):
                        </label>
                        <input
                            id="catalog_discount"
                            name="discount"
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Ej: 10"
                            value={formState.discount}
                            onChange={onFormChange}
                            style={styles.modalInput}
                        />
                    </div>

                    <button
                        type="submit"
                        style={
                            isSaving ? styles.buttonLoading : (saveSuccess ? styles.buttonSuccess : styles.button)
                        }
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <><span style={styles.spinner}></span> Editando...</>
                        ) : saveSuccess ? (
                            '¡Guardado!'
                        ) : (
                            editingId ? 'Actualizar Servicio' : 'Guardar Nuevo Servicio'
                        )}
                    </button>
                </form>

                {/* Lista de Servicios del Catálogo */}
                <h3 style={styles.listTitle}>Servicios Guardados</h3>
                <ul style={styles.catalogList}>
                    {catalogServices.length === 0 && <li style={{ padding: '10px' }}>No hay servicios en tu catálogo.</li>}
                    {catalogServices.map(s => (
                        <li key={s.id} style={styles.serviceItem}>
                            <span>
                                {s.name} (${s.price}) {(s.discount || 0) > 0 ? `(-${s.discount}%)` : ''}
                            </span>
                            <div>
                                <button onClick={() => onEditClick(s)} style={styles.editButton}>Editar</button>
                                <button onClick={() => onDeleteClick(s.id)} style={styles.deleteButton}>Borrar</button>
                            </div>
                        </li>
                    ))}
                </ul>

                <button onClick={onClose} style={styles.closeButton}>Cerrar</button>
            </div>
        </div>
    );
}

export default CatalogManagerModal;