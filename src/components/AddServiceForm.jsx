import React from 'react';

// Estilos locales del componente
const styles = {
    listTitle: {
        borderBottom: '1px solid #eee',
        paddingBottom: '5px',
        marginTop: '20px'
    },
    form: {
        marginBottom: '20px',
    },
    inputGroup: {
        display: 'flex',
        gap: '10px',
        marginBottom: '10px',
    },
    input: {
        flex: '1',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        minWidth: 0,
        backgroundColor: '#ffffff',
        color: '#213547',
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
    },
    catalogSelect: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginBottom: '10px',
        backgroundColor: '#f8f9fa',
        color: '#213547',
    }
};

function AddServiceForm({ 
    formState, 
    onFormChange, 
    onAddService, 
    catalogServices, 
    onCatalogSelect 
}) {
    return (
        <>
            <h3 style={styles.listTitle}>Agregar Servicio</h3>
            <form onSubmit={onAddService} style={styles.form}>
                
                <select onChange={onCatalogSelect} style={styles.catalogSelect}>
                    <option value="">-- Cargar Servicio desde Catálogo --</option>
                    {catalogServices.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} (${s.price})
                        </option>
                    ))}
                </select>

                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        name="name" // Clave para el handler
                        placeholder="Nombre del Servicio"
                        value={formState.name}
                        onChange={onFormChange}
                        style={{ ...styles.input, flex: 3 }}
                    />
                    <input
                        type="number"
                        name="quantity" // Clave para el handler
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={formState.quantity}
                        onChange={onFormChange}
                        style={{ ...styles.input, flex: 1 }}
                    />
                    <input
                        type="number"
                        name="price" // Clave para el handler
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={formState.price}
                        onChange={onFormChange}
                        style={{ ...styles.input, flex: 1.5 }}
                    />
                    <input
                        type="number"
                        name="discount" // Clave para el handler
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Desc. %"
                        value={formState.discount}
                        onChange={onFormChange}
                        style={{ ...styles.input, flex: 1 }}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Agregar Servicio
                </button>
            </form>
        </>
    );
}

export default AddServiceForm;