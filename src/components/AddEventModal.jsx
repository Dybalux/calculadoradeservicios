// src/components/AddEventModal.jsx
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const styles = {
    overlay: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001] p-4",
    content: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md text-gray-900 dark:text-gray-100",
    title: "text-2xl font-bold mb-4",
    label: "block font-semibold mb-1 text-sm text-gray-700 dark:text-gray-300",
    input: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500",
    buttonGroup: "flex justify-between mt-6",
    rightButtons: "flex gap-3",
    btnCancel: "px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition",
    btnSave: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition",
    btnDelete: "px-4 py-2 bg-red-100 text-red-600 border border-red-200 rounded hover:bg-red-200 transition"
};

function AddEventModal({ isOpen, onClose, onSave, onDelete, initialDate, eventToEdit }) {
    const [title, setTitle] = useState('');
    const [clientName, setClientName] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    useEffect(() => {
        if (isOpen) {
            const toLocalISOString = (date) => {
                if (!date) return '';
                const d = new Date(date);
                const offset = d.getTimezoneOffset() * 60000;
                return new Date(d.getTime() - offset).toISOString().slice(0, 16);
            };

            if (eventToEdit) {
                // Modo Edición
                setTitle(eventToEdit.title);
                setClientName(eventToEdit.client_info?.name || '');
                setStart(toLocalISOString(eventToEdit.start));
                setEnd(toLocalISOString(eventToEdit.end));
            } else if (initialDate) {
                // Modo Creación
                setTitle('');
                setClientName('');
                setStart(toLocalISOString(initialDate));
                const endDate = new Date(initialDate.getTime() + 60 * 60 * 1000);
                setEnd(toLocalISOString(endDate));
            }
        }
    }, [isOpen, initialDate, eventToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: eventToEdit?.id,
            title,
            start_time: start,
            end_time: end,
            client_name: clientName
        });
        onClose();
    };

    // 👇 ESTA FUNCIÓN FALTABA EN TU CÓDIGO ANTERIOR
    const handleDelete = () => {
        // Lanzamos el toast interactivo
        toast((t) => (
            <div className="flex flex-col items-center gap-3 min-w-[200px]">
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                    ¿Eliminar este evento?
                </p>
                <div className="flex gap-3">
                    <button
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-white transition"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition shadow-sm"
                        onClick={() => {
                            onDelete(eventToEdit.id); // Llama a la función de borrado
                            toast.dismiss(t.id);
                            onClose();
                        }}
                    >
                        Sí, eliminar
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-text, #333)',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            },
            className: "dark:bg-gray-800 dark:text-white"
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.content} onClick={e => e.stopPropagation()}>
                <h3 className={styles.title}>
                    {eventToEdit ? 'Editar Evento' : 'Nuevo Evento'}
                </h3>

                <form onSubmit={handleSubmit}>
                    <label className={styles.label}>Título del Evento</label>
                    <input
                        className={styles.input}
                        placeholder="Ej: Cumpleaños de Sofía"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        autoFocus
                    />

                    <label className={styles.label}>Cliente</label>
                    <input
                        className={styles.input}
                        placeholder="Nombre del cliente"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                    />

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className={styles.label}>Inicio</label>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={start}
                                onChange={e => setStart(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label className={styles.label}>Fin</label>
                            <input
                                type="datetime-local"
                                className={styles.input}
                                value={end}
                                onChange={e => setEnd(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.buttonGroup}>
                        <div>
                            {/* Solo mostramos el botón si estamos editando (eventToEdit existe) */}
                            {eventToEdit && (
                                <button type="button" onClick={handleDelete} className={styles.btnDelete}>
                                    Eliminar
                                </button>
                            )}
                        </div>

                        <div className={styles.rightButtons}>
                            <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
                            <button type="submit" className={styles.btnSave}>
                                {eventToEdit ? 'Actualizar' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddEventModal; 