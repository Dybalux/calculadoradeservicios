import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importar Componentes Visuales
import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';
import ConfirmModal from '../components/ConfirmModal';

// Importar Lógica (Hooks)
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';

// --- CAMBIO 1: Importamos el logo (como en el paso anterior) ---
// (Asegúrate de poner tu logo en 'src/assets/' y cambiar el nombre aquí)
import companyLogo from '../assets/LogoAhijuna.png';


function ServiceCalculator() {

    // --- LÓGICA / ESTADO ---
    
    const { clientData, issuerData, handleClientChange, handleIssuerChange } = useQuoteData();
    const { 
        catalogServices, 
        modalState, 
        confirmModalState,
        catalogActions 
    } = useCatalogManager();


    // --- CAMBIO 2: Renombramos 'total' a 'subtotal' y añadimos 'advancePayment' ---
    const {
        services,
        total: subtotal, // Renombramos 'total' a 'subtotal'
        editingId,
        editForm,
        setEditForm,
        actions: serviceActions
    } = useServiceManager();

    // Estado local para el formulario "Agregar Servicio"
    const [newServiceForm, setNewServiceForm] = useState({
        name: '',
        price: '',
        quantity: 1,
        discount: ''
    });

    // --- NUEVO ESTADO para la seña/adelanto ---
    const [advancePayment, setAdvancePayment] = useState('');

    // --- Handlers (Funciones "puente") ---
    // (Sin cambios...)
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

    // --- CAMBIO 3: Actualizamos la función del PDF ---
    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        // 1. Logo
        doc.addImage(companyLogo, 'SVG', 14, 15, 30, 30);

        // 2. Datos Cliente/Emisor (movidos hacia abajo)
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

        // 3. Título (movido hacia abajo)
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 95, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 101, { align: 'center' });

        // 4. Tabla (movida hacia abajo)
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

        // --- 5. Lógica de Totales (Subtotal, Seña, Balance) ---
        const finalY = doc.lastAutoTable.finalY;
        const advanceAmountPDF = parseFloat(advancePayment) || 0;
        const remainingBalancePDF = subtotal - advanceAmountPDF;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
        
        // Solo mostramos la seña si es mayor a 0
        if (advanceAmountPDF > 0) {
            doc.text(`Seña: -$${advanceAmountPDF.toFixed(2)}`, 196, finalY + 22, { align: 'right' });
        }
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Balance Pendiente: $${remainingBalancePDF.toFixed(2)}`, 196, finalY + 30, { align: 'right' });

        // 6. Métodos de Pago
        if (issuerData.paymentMethods) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Métodos de Pago:', 14, finalY + 40); // Ajustamos 'Y'
            doc.setFont('helvetica', 'normal');
            const paymentLines = doc.splitTextToSize(issuerData.paymentMethods, 180);
            doc.text(paymentLines, 14, finalY + 46);
        }
        
        doc.save('presupuesto-servicios.pdf');
    };

    // --- Estilos ---
    // --- CAMBIO 4: Añadimos nuevos estilos para el Resumen de Total ---
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
        advanceInput: { // Estilo para el input de la seña
            fontSize: '16px',
            fontWeight: 'bold',
            padding: '5px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '120px',
            textAlign: 'right',
            backgroundColor: '#ffffff', // Asegura fondo blanco
            color: '#213547',          // Asegura texto oscuro
        },
        finalBalance: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#28a745', // Verde
        },
        // --- FIN DE NUEVOS ESTILOS ---

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
                onConfirm={catalogActions.confirmDelete} // <-- El handler de confirmar
                onCancel={catalogActions.cancelDelete}   // <-- El handler de cancelar
            />
            
            <h2>Presupuesto de Servicios</h2>

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

            {/* --- CAMBIO 4: JSX del Total actualizado --- */}
            <div style={styles.summarySection}>
                {/* Fila del Subtotal */}
                <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Subtotal:</span>
                    <span style={styles.summaryAmount}>${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Fila de la Seña (Input) */}
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

                {/* Fila del Balance Pendiente */}
                <div style={styles.summaryRow}>
                    <span style={{...styles.summaryLabel, ...styles.finalBalance}}>
                        Balance Pendiente:
                    </span>
                    <span style={{...styles.summaryAmount, ...styles.finalBalance}}>
                        ${remainingBalance.toFixed(2)}
                    </span>
                </div>
            </div>
            {/* --- Fin del cambio --- */}
            
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