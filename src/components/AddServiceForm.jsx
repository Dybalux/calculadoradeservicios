// src/components/AddServiceForm.jsx

import React from 'react';

// --- Estilos de Tailwind ---
// Definimos las clases aquí para que el JSX sea limpio
const styles = {
    listTitle: "border-b border-gray-700 pb-2 mt-5 text-xl font-semibold text-white",
    form: "mb-5",
    catalogSelect: "w-full p-2.5 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
    
    // --- ESTA ES LA CORRECCIÓN ---
    // 'flex' por defecto es 'flex-row' (horizontal)
    inputGroup: "flex gap-4 mb-4", 
    
    input: "p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
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
            {/* --- JSX con 'className' en lugar de 'style' --- */}
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

                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        name="name" 
                        placeholder="Nombre del Servicio"
                        value={formState.name}
                        onChange={onFormChange}
                        // --- CORRECCIÓN: quitamos el 'md:' ---
                        className={`${styles.input} flex-[3]`} 
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={formState.quantity}
                        onChange={onFormChange}
                        className={`${styles.input} flex-[1]`}
                    />
                    <input
                        type="number"
                        name="price"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={formState.price}
                        onChange={onFormChange}
                        className={`${styles.input} flex-[1.5]`}
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
                        className={`${styles.input} flex-[1]`}
                    />
                </div>
                <button type="submit" className={styles.button}>
                    Agregar Servicio
                </button>
            </form>
        </>
    );
}

export default AddServiceForm;