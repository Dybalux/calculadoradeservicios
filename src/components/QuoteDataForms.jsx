import React from 'react';

// Estilos locales del componente
const styles = {
    dataFormsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px',
        marginBottom: '20px',
    },
    dataFormBox: {
        flex: '1',
        border: '1px solid #eee',
        padding: '15px',
        borderRadius: '6px',
        backgroundColor: 'gray',
    },
    dataFormBoxTitle: {
        color: 'black',
        marginTop: 0,
        marginBottom: '15px'
    },
    dataInput: {
        width: 'calc(100% - 16px)',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        marginBottom: '5px',
        backgroundColor: '#ffffff',
        color: '#213547',
    },
    textareaInput: {
        width: 'calc(100% - 16px)',
        padding: '8px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontFamily: 'Arial, sans-serif',
        resize: 'vertical',
        backgroundColor: '#ffffff',
        color: '#213547',
    },
};

function QuoteDataForms({ clientData, issuerData, onClientChange, onIssuerChange }) {
    return (
        <div style={styles.dataFormsContainer}>
            <div style={styles.dataFormBox}>
                <h3 style={styles.dataFormBoxTitle}>Datos del Cliente</h3>
                <input name="name" placeholder="Nombre del Cliente" value={clientData.name} onChange={onClientChange} style={styles.dataInput} />
                <input name="company" placeholder="Empresa (Opcional)" value={clientData.company} onChange={onClientChange} style={styles.dataInput} />
                <input name="email" type="email" placeholder="Email (Opcional)" value={clientData.email} onChange={onClientChange} style={styles.dataInput} />
            </div>
            <div style={styles.dataFormBox}>
                <h3 style={styles.dataFormBoxTitle}>Mis Datos (Emisor)</h3>
                <input name="name" placeholder="Tu Nombre" value={issuerData.name} onChange={onIssuerChange} style={styles.dataInput} />
                <input name="company" placeholder="Tu Empresa (Opcional)" value={issuerData.company} onChange={onIssuerChange} style={styles.dataInput} />
                <input name="email" type="email" placeholder="Tu Email (Opcional)" value={issuerData.email} onChange={onIssuerChange} style={styles.dataInput} />
                <textarea
                    name="paymentMethods" placeholder="Métodos de pago (ej: CBU, Alias, etc.)"
                    value={issuerData.paymentMethods} onChange={onIssuerChange}
                    style={styles.textareaInput} rows={3}
                />
            </div>
        </div>
    );
}

export default QuoteDataForms;