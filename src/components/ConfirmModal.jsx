// src/components/ConfirmModal.jsx

import React from 'react';

// Estilos del modal (usando Tailwind)
const styles = {
    overlay: "fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1001]",
    content: "bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-gray-900",
    title: "text-xl font-bold mb-4",
    message: "text-base text-gray-700 mb-6",
    buttonContainer: "flex justify-end gap-4",
    buttonConfirm: "px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors",
    buttonCancel: "px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition-colors",
};

function ConfirmModal({
    show,
    title,
    message,
    onConfirm,
    onCancel
}) {
    if (!show) {
        return null;
    }

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
                <div className={styles.buttonContainer}>
                    <button onClick={onCancel} className={styles.buttonCancel}>
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className={styles.buttonConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;