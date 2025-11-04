// src/components/QuoteDataForms.jsx

import React from 'react';

// Clases de Tailwind (actualizadas con dark:)
const styles = {
    container: "flex flex-col md:flex-row justify-between gap-6 mb-6",
    formBox: "flex-1 border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50",
    title: "text-xl font-bold text-gray-800 dark:text-white mt-0 mb-4",
    input: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
    textarea: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
};

function QuoteDataForms({ clientData, issuerData, onClientChange, onIssuerChange }) {
    return (
        <div className={styles.container}>
            <div className={styles.formBox}>
                <h3 className={styles.title}>Datos del Cliente</h3>
                <input name="name" placeholder="Nombre del Cliente" value={clientData.name} onChange={onClientChange} className={styles.input} />
                <input name="company" placeholder="Empresa (Opcional)" value={clientData.company} onChange={onClientChange} className={styles.input} />
                <input 
                    name="phone" // 👈 ANTES 'email'
                    type="tel"   // 👈 ANTES 'email'
                    placeholder="Celular (Opcional)" // 👈 ANTES 'Email (Opcional)'
                    value={clientData.phone} // 👈 ANTES 'clientData.email'
                    onChange={onClientChange} 
                    className={styles.input} 
                />
            </div>
            <div className={styles.formBox}>
                <h3 className={styles.title}>Mis Datos (Emisor)</h3>
                <input name="name" placeholder="Tu Nombre" value={issuerData.name} onChange={onIssuerChange} className={styles.input} />
                <input name="company" placeholder="Tu Empresa (Opcional)" value={issuerData.company} onChange={onIssuerChange} className={styles.input} />
                <input name="phone" type="phone" placeholder="Tu Celular (Opcional)" value={issuerData.phone} onChange={onIssuerChange} className={styles.input} />
                
                <textarea
                    name="paymentMethods" placeholder="Métodos de pago (ej: CBU, Alias, etc.)"
                    value={issuerData.paymentMethods} onChange={onIssuerChange}
                    className={styles.textarea} rows={3}
                />
            </div>
        </div>
    );
}

export default QuoteDataForms;