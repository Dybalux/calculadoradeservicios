// src/components/AddServiceForm.jsx

import React from 'react';

// Clases de Tailwind (actualizadas con dark: y anchos válidos)
const styles = {
    listTitle: "border-b border-gray-200 dark:border-gray-700 pb-2 mt-5 text-xl font-bold text-gray-800 dark:text-white",
    form: "mb-5",
    catalogSelect: "w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-md mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500",
    inputGroup: "flex flex-col sm:flex-row gap-4 mb-4",
    input: "p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
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
                    {/* --- 👇 CORRECCIÓN: Clases de ancho fraccional (w-N/12) --- */}
                    <input
                        type="text"
                        name="name" 
                        placeholder="Nombre del Servicio"
                        value={formState.name}
                        onChange={onFormChange}
                        className={`${styles.input} w-full sm:w-5/12`} 
                    />
                    <input
                        type="number"
                        name="quantity"
                        min="1"
                        step="1"
                        placeholder="Cant/Horas"
                        value={formState.quantity}
                        onChange={onFormChange}
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
                        className={`${styles.input} w-full sm:w-2/12`}
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