// src/components/AddServiceForm.jsx

import React from 'react';

// --- Estilos de Tailwind ---
const styles = {
    listTitle: "border-b border-gray-700 pb-2 mt-5 text-xl font-semibold text-white",
    form: "mb-5",
    catalogSelect: "w-full p-2.5 border border-gray-600 rounded-md mb-4 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
    
    // 'flex' por defecto es 'flex-row' (horizontal)
    inputGroup: "flex flex-wrap md:flex-nowrap gap-4 mb-4", // Añadimos flex-wrap
    
    // --- 👇 CORRECCIÓN AQUÍ ---
    // Usamos 'w-full' (ancho completo) y dejamos que flex-shrink haga su magia
    input: "flex-shrink p-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500",
    
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

                <div className={styles.inputGroup}>
                    {/* --- 👇 CORRECCIÓN: Usamos 'w-full' y especificamos anchos relativos para 'md:' --- */}
                    <input
                        type="text"
                        name="name" 
                        placeholder="Nombre del Servicio"
                        value={formState.name}
                        onChange={onFormChange}
                        className={`${styles.input} w-full md:w-3/6`} // 3/6 del ancho en pantallas medianas
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={formState.quantity}
                        onChange={onFormChange}
                        className={`${styles.input} w-full md:w-1/6`} // 1/6
                    />
                    <input
                        type="number"
                        name="price"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={formState.price}
                        onChange={onFormChange}
                        className={`${styles.input} w-full md:w-2/6`} // 2/6 (simplificado de 1.5/6)
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
                        className={`${styles.input} w-full md:w-1/6`} // 1/6
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