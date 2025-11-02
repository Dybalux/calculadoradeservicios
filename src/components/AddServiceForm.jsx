// src/components/AddServiceForm.jsx

import React from 'react';

// Clases de Tailwind
const styles = {
    listTitle: "border-b border-gray-200 pb-2 mt-5 text-xl font-bold text-gray-800",
    form: "mb-5",
    catalogSelect: "w-full p-2.5 border border-gray-300 rounded-md mb-4 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
    
    // --- 👇 CORRECCIÓN 1: 'md:flex-row' cambiado a 'sm:flex-row' ---
    inputGroup: "flex flex-col sm:flex-row gap-4 mb-4", // Se apila en mobile, horizontal en PC
    
    input: "flex-1 p-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
    button: "w-full p-2.5 bg-blue-600 text-white rounded-md cursor-pointer text-base font-medium hover:bg-blue-700 transition-colors",
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
            <h3 className={styles.listTitle}>Agregar Servicio</h3>
            <form onSubmit={onAddService} className={styles.form}>
                
                <select onChange={onCatalogSelect} className={styles.catalogSelect}>
                    <option value="">-- Cargar Servicio desde Catálogo --</option>
                    {catalogServices.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} (${s.price})
                        </option>
                    ))}
                </select>

                {/* --- 👇 CORRECCIÓN 2: Clases de ancho fraccional (w-N/12) --- */}
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        name="name" 
                        placeholder="Nombre del Servicio"
                        value={formState.name}
                        onChange={onFormChange}
                        // Usamos un sistema de 12 columnas: 5/12 para el nombre
                        className={`${styles.input} w-full sm:w-5/12`} 
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={formState.quantity}
                        onChange={onFormChange}
                        // 2/12 para la cantidad
                        className={`${styles.input} w-full sm:w-2/12`}
                    />
                    <input
                        type="number"
                        name="price"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={formState.price}
                        onChange={onFormChange}
                        // 3/12 para el precio
                        className={`${styles.input} w-full sm:w-3/12`}
                    />
                    <input
                        type="number"
                        name="discount"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Desc. %"
                        value={formState.discount}
                        onChange={onFormChange}
                        // 2/12 para el descuento
                        className={`${styles.input} w-full sm:w-2/12`}
                    />
                </div>
                {/* --- 👆 FIN DE LA CORRECCIÓN 👆 --- */}
                
                <button type="submit" className={styles.button}>
                    Agregar Servicio
                </button>
            </form>
        </>
    );
}

export default AddServiceForm;