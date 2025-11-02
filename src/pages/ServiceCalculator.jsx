import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importar Componentes Visuales
import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';
import ConfirmModal from '../components/ConfirmModal'; // <--- ¡Asegúrate de que este import esté!

// Importar Lógica (Hooks)
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';

import companyLogo from '../assets/LogoAhijuna.png';

// --- NUEVA FUNCIÓN HELPER (fuera del componente) ---
// Para obtener la fecha de hoy en formato YYYY-MM-DD (que usa el input)
const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- NUEVA FUNCIÓN HELPER (fuera del componente) ---
// Para formatear YYYY-MM-DD a DD/MM/YYYY para el PDF
const formatDateForPDF = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        console.error("Error al formatear fecha, usando valor original", e);
        return dateString; // Devuelve la fecha tal cual si falla
    }
};


function ServiceCalculator() {

    // --- LÓGICA / ESTADO ---
    
    const { clientData, issuerData, handleClientChange, handleIssuerChange } = useQuoteData();
    const { 
        catalogServices, 
        modalState, 
        confirmModalState,
        catalogActions 
    } = useCatalogManager();

    const {
        services,
        total: subtotal,
        editingId,
        editForm,
        setEditForm,
        actions: serviceActions
    } = useServiceManager();

    const [newServiceForm, setNewServiceForm] = useState({
        name: '',
        price: '',
        quantity: 1,
        discount: ''
    });

    const [advancePayment, setAdvancePayment] = useState('');

    // --- NUEVO ESTADO para la fecha ---
    const [quoteDate, setQuoteDate] = useState(getTodayDateString());

    // --- Handlers (Funciones "puente") ---
    // (No hay cambios en los handlers)
    const handleNewServiceFormChange = (e) => {
        const { name, value } = e.target;
        setNewServiceForm(prev => ({ ...prev, [name]: value }));
    };
    const handleNewServiceSubmit = (e) => {
        e.preventDefault();
        const success = serviceActions.addService(newServiceForm);
        if (success) {
            setNewServiceForm({ name: '', price: '', quantity: 1, discount: '' });
        }
    };
    const handleCatalogSelect = (e) => {
        const catalogId = e.target.value;
        if (!catalogId) {
            setNewServiceForm({ name: '', price: '', quantity: 1, discount: '' });
            return;
        }
        const serviceToLoad = catalogServices.find(s => s.id === parseInt(catalogId, 10));
        if (serviceToLoad) {
            setNewServiceForm({
                name: serviceToLoad.name,
                price: serviceToLoad.price.toString(),
                quantity: 1,
                discount: (serviceToLoad.discount || 0).toString()
            });
        }
    };

    // --- handleGeneratePDF MODIFICADO ---
    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        doc.addImage(companyLogo, 'PNG', 14, 15, 30, 30); // <- Cambié 'SVG' a 'PNG' (asumiendo por el nombre del archivo)

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DE:', 14, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(issuerData.name || '(Tu Nombre)', 14, 66);
        doc.text(issuerData.company || '(Tu Empresa)', 14, 72);
        doc.text(issuerData.email || '(Tu Email)', 14, 78);
        doc.setFont('helvetica', 'bold');
        doc.text('PARA:', 105, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(clientData.name || '(Nombre Cliente)', 105, 66);
        doc.text(clientData.company || '(Empresa Cliente)', 105, 72);
        doc.text(clientData.email || '(Email Cliente)', 105, 78);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 95, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // --- CAMBIO AQUÍ: Usamos la fecha del estado ---
        doc.text(`Fecha: ${formatDateForPDF(quoteDate)}`, 105, 101, { align: 'center' });

        const tableColumn = ["Servicio", "Cant.", "P. Unit. ($)", "Desc. %", "Subtotal ($)"];
        const tableRows = [];
        services.forEach(service => {
            const discount = service.discount || 0;
            const baseSubtotal = service.price * service.quantity;
            const discountAmount = baseSubtotal * (discount / 100);
            const finalSubtotal = baseSubtotal - discountAmount;
            tableRows.push([
                service.name,
                service.quantity,
                service.price.toFixed(2),
                `${discount}%`,
                finalSubtotal.toFixed(2)
            ]);
        });
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 110
        });

        const finalY = doc.lastAutoTable.finalY;
        const advanceAmountPDF = parseFloat(advancePayment) || 0;
        const remainingBalancePDF = subtotal - advanceAmountPDF;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
        
        if (advanceAmountPDF > 0) {
            doc.text(`Seña: -$${advanceAmountPDF.toFixed(2)}`, 196, finalY + 22, { align: 'right' });
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Balance Pendiente: $${remainingBalancePDF.toFixed(2)}`, 196, finalY + 30, { align: 'right' });

        if (issuerData.paymentMethods) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Métodos de Pago:', 14, finalY + 40); 
            doc.setFont('helvetica', 'normal');
            const paymentLines = doc.splitTextToSize(issuerData.paymentMethods, 180);
            doc.text(paymentLines, 14, finalY + 46);
        }
        
        doc.save('presupuesto-servicios.pdf');
    };

    // --- Estilos ---
    // --- CAMBIO: Añadimos estilos para el input de fecha ---
    const styles = {
        calculatorContainer: {
            fontFamily: 'Arial, sans-serif',
            width: '600px',
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        },
        
        // --- NUEVOS ESTILOS AQUÍ ---
        headerContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: '1px solid #eee',
        },
        headerTitle: {
            margin: 0, // Quitamos el margen por defecto de h2
            fontSize: '24px',
            color: '#333' // Aseguramos color de texto
        },
        dateInputGroup: {
            display: 'flex',
            flexDirection: 'column',
        },
        dateLabel: {
            fontSize: '12px',
            color: '#555',
            marginBottom: '4px',
            fontWeight: 'bold',
        },
        dateInput: {
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
            color: '#213547',
            backgroundColor: '#ffffff',
        },
        // --- FIN DE NUEVOS ESTILOS ---

        summarySection: {
            marginTop: '20px',
            borderTop: '1px solid #eee',
            paddingTop: '15px',
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
        },
        summaryLabel: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#555',
        },
        summaryAmount: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#333',
        },
        advanceInput: { 
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '5px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '120px',
            textAlign: 'right',
            backgroundColor: '#ffffff', 
            color: '#213547',          
        },
        finalBalance: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#28a745', 
        },
        pdfButton: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px',
        },
        pdfButtonDisabled: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#ccc',
            color: '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            fontSize: '16px',
            marginTop: '10px',
        },
        catalogToggleButton: {
            width: '100%',
            padding: '8px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '20px',
        },
    };

    // --- Cálculos de Totales ---
    const advanceAmount = parseFloat(advancePayment) || 0;
    const remainingBalance = subtotal - advanceAmount;

    // --- RENDERIZADO ---
    return (
        <div style={styles.calculatorContainer}>
            
            <CatalogManagerModal
                show={modalState.show}
                onClose={catalogActions.toggleModal}
                onSubmit={catalogActions.handleSubmit}
                onFormChange={catalogActions.handleFormChange}
                formState={modalState.formState}
                catalogServices={catalogServices}
                onEditClick={catalogActions.startEdit}
                onDeleteClick={catalogActions.deleteItem}
                editingId={modalState.editingId}
                isSaving={modalState.isSaving}
                saveSuccess={modalState.saveSuccess}
            />

            <ConfirmModal
                show={confirmModalState.isOpen}
                title="Confirmar Eliminación"
                message="¿Estás seguro de que quieres eliminar este servicio del catálogo? Esta acción no se puede deshacer."
                onConfirm={catalogActions.confirmDelete}
                onCancel={catalogActions.cancelDelete}
            />
            
            {/* --- CAMBIO: Título y Fecha ahora en un div --- */}
            <div style={styles.headerContainer}>
                <h2 style={styles.headerTitle}>Presupuesto de Servicios</h2>
                <div style={styles.dateInputGroup}>
                    <label htmlFor="quoteDate" style={styles.dateLabel}>
                        Fecha del Presupuesto:
                    </label>
                    <input
                        id="quoteDate"
                        type="date"
                        value={quoteDate}
                        onChange={(e) => setQuoteDate(e.target.value)}
                        style={styles.dateInput}
                    />
                </div>
            </div>
            {/* --- Fin del cambio --- */}

            <button onClick={catalogActions.toggleModal} style={styles.catalogToggleButton}>
                Administrar Catálogo de Servicios
            </button>

            <QuoteDataForms
                clientData={clientData}
                issuerData={issuerData}
                onClientChange={handleClientChange}
                onIssuerChange={handleIssuerChange}
            />

            <AddServiceForm
                formState={newServiceForm}
                onFormChange={handleNewServiceFormChange}
                onAddService={handleNewServiceSubmit}
                catalogServices={catalogServices}
                onCatalogSelect={handleCatalogSelect}
            />

            <ServiceList
                services={services}
                editingId={editingId}
                editForm={editForm}
                setEditForm={setEditForm}
                onSaveEdit={serviceActions.saveEdit}
                onCancelEdit={serviceActions.cancelEdit}
                onEditClick={serviceActions.startEdit}
                onDeleteService={serviceActions.deleteService}
            />

            {/* (Sección de Totales sin cambios) */}
            <div style={styles.summarySection}>
                <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Subtotal:</span>
                    <span style={styles.summaryAmount}>${subtotal.toFixed(2)}</span>
                </div>
                <div style={styles.summaryRow}>
                    <label htmlFor="advancePayment" style={styles.summaryLabel}>
                        Seña/Adelanto:
                    </label>
                    <input
                        id="advancePayment"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={advancePayment}
                        onChange={(e) => setAdvancePayment(e.target.value)}
                        style={styles.advanceInput}
                    />
                </div>
                <div style={styles.summaryRow}>
                    <span style={{...styles.summaryLabel, ...styles.finalBalance}}>
                        Balance Pendiente:
                    </span>
                    <span style={{...styles.summaryAmount, ...styles.finalBalance}}>
                        ${remainingBalance.toFixed(2)}
                    </span>
                </div>
            </div>
            
            <button
                onClick={handleGeneratePDF}
                style={services.length > 0 ? styles.pdfButton : styles.pdfButtonDisabled}
                disabled={services.length === 0}
            >
                Generar Presupuesto PDF
            </button>
        </div>
    );
}

export default ServiceCalculator;