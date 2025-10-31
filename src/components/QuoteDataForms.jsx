// src/components/QuoteDataForms.jsx

import React from 'react';

// --- ¡El objeto 'styles' se eliminó! ---

function QuoteDataForms({ clientData, issuerData, onClientChange, onIssuerChange }) {
    
    // Clases de Tailwind reutilizables
    const formBoxClass = "flex-1 border border-gray-700 p-4 rounded-md bg-gray-800";
    const titleClass = "text-lg font-semibold text-white mt-0 mb-4";
    const inputClass = "w-full p-2 border border-gray-600 rounded-md mb-2 bg-gray-700 text-white placeholder-gray-400";
    const textareaClass = `${inputClass} resize-vertical`; // Reutiliza y añade 'resize'

    return (
        // --- 👇 Clases de Tailwind aplicadas 👇 ---
        <div className="flex flex-col md:flex-row justify-between gap-5 mb-5">
            
            <div className={formBoxClass}>
                <h3 className={titleClass}>Datos del Cliente</h3>
                <input 
                    name="name" 
                    placeholder="Nombre del Cliente" 
                    value={clientData.name} 
                    onChange={onClientChange} 
                    className={inputClass} 
                />
                <input 
                    name="company" 
                    placeholder="Empresa (Opcional)" 
                    value={clientData.company} 
                    onChange={onClientChange} 
                    className={inputClass} 
                />
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Email (Opcional)" 
                    value={clientData.email} 
                    onChange={onClientChange} 
                    className={inputClass} 
                />
            </div>
            
            <div className={formBoxClass}>
                <h3 className={titleClass}>Mis Datos (Emisor)</h3>
                <input 
                    name="name" 
                    placeholder="Tu Nombre" 
                    value={issuerData.name} 
                    onChange={onIssuerChange} 
                    className={inputClass} 
                />
                <input 
                    name="company" 
                    placeholder="Tu Empresa (Opcional)" 
                    value={issuerData.company} 
                    onChange={onIssuerChange} 
                    className={inputClass} 
                />
                <input 
                    name="email" 
                    type="email" 
                    placeholder="Tu Email (Opcional)" 
                    value={issuerData.email} 
                    onChange={onIssuerChange} 
                    className={inputClass} 
                />
                <textarea
                    name="paymentMethods" 
                    placeholder="Métodos de pago (ej: CBU, Alias, etc.)"
                    value={issuerData.paymentMethods} 
                    onChange={onIssuerChange}
                    className={textareaClass} 
                    rows={3}
                />
            </div>
        </div>
    );
}

export default QuoteDataForms;