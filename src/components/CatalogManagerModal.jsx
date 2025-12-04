import React from 'react';

// Clases de Tailwind (actualizadas con dark:)
const styles = {
    overlay: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4",
    content: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl text-gray-900 dark:text-gray-100 max-h-[90vh] flex flex-col",
    title: "text-2xl font-bold mb-4",
    form: "mb-5",
    inputRow: "flex flex-col sm:flex-row gap-4 mb-0",
    inputGroup: "flex flex-col flex-1",
    label: "block font-semibold mb-1 text-sm text-gray-700 dark:text-gray-300",
    input: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
    listTitle: "border-b border-gray-200 dark:border-gray-700 pb-2 mt-4 text-xl font-bold",
    listContainer: "flex-1 overflow-y-auto",
    list: "list-none p-0",
    listItem: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-3 px-2 border-b border-gray-200 dark:border-gray-700",
    listItemText: "text-gray-800 dark:text-gray-100",
    closeButton: "w-full p-2.5 bg-red-600 text-white rounded-md cursor-pointer text-base font-medium hover:bg-red-700 transition-colors mt-6",
    spinner: "inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 align-middle",
    editButton: "bg-yellow-500 text-black px-2 py-1.5 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors",
    deleteButton: "bg-red-600 text-white px-2 py-1.5 rounded-md text-sm font-medium ml-2 hover:bg-red-700 transition-colors",
};

function CatalogManagerModal({
    show,
    onClose,
    onSubmit,
    onFormChange,
    formState,
    catalogServices,
    onEditClick,
    onDeleteClick,
    editingId,
    isSaving,
    saveSuccess,
    onMigrateClick,
}) {

    if (!show) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                {/* Cabecera con Botón de Migración */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Catálogo de Servicios</h2>

                    {/* Botón Mágico de Migración */}
                    <button
                        onClick={onMigrateClick}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition"
                        title="Subir mis servicios guardados en este navegador a la nube"
                    >
                        Migrar Datos Locales
                    </button>
                </div>
                <h2 className={styles.title}>Administrar Catálogo de Servicios</h2>

                <form onSubmit={onSubmit} className={styles.form}>
                    <div className={styles.inputRow}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="catalog_name" className={styles.label}>Nombre:</label>
                            <input
                                id="catalog_name"
                                name="name"
                                placeholder="Ej: Diseño de Logo"
                                value={formState.name}
                                onChange={onFormChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="catalog_price" className={styles.label}>Precio ($):</label>
                            <input
                                id="catalog_price"
                                name="price"
                                type="number"
                                min="0.01"
                                step="0.01"
                                placeholder="Ej: 1500"
                                value={formState.price}
                                onChange={onFormChange}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label htmlFor="catalog_discount" className={styles.label}>Desc. %:</label>
                            <input
                                id="catalog_discount"
                                name="discount"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Ej: 10"
                                value={formState.discount}
                                onChange={onFormChange}
                                className={styles.input}
                            />
                        </div>
                        <div className="flex items-end mt-4 sm:mt-0">
                            <button
                                type="submit"
                                // Usamos style para el color dinámico, className para todo lo demás
                                style={isSaving ? { backgroundColor: '#f97316' } : (saveSuccess ? { backgroundColor: '#22c55e' } : { backgroundColor: '#2563eb' })}
                                className="w-full sm:w-auto p-2.5 text-white rounded-md cursor-pointer text-base font-medium transition-colors"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <><span className={styles.spinner}></span> Editando...</>
                                ) : saveSuccess ? (
                                    '¡Guardado!'
                                ) : (
                                    editingId ? 'Actualizar' : 'Guardar'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <h3 className={styles.listTitle}>Servicios Guardados</h3>
                <div className={styles.listContainer}>
                    <ul className={styles.list}>
                        {catalogServices.length === 0 && <li className="text-gray-500 dark:text-gray-400 text-center py-4">No hay servicios en tu catálogo.</li>}
                        {catalogServices.map(s => (
                            <li key={s.id} className={styles.listItem}>
                                <span className={styles.listItemText}>
                                    {s.name} (${s.price}) {(s.discount || 0) > 0 ? `(-${s.discount}%)` : ''}
                                </span>
                                <div className="mt-2 sm:mt-0">
                                    <button onClick={() => onEditClick(s)} className={styles.editButton}>Editar</button>
                                    <button onClick={() => onDeleteClick(s.id)} className={styles.deleteButton}>Borrar</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
            </div>
        </div>
    );
}

export default CatalogManagerModal;