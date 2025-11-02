import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importar Componentes Visuales
import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';

// Importar Lógica (Hooks)
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';

// --- PASO 1: IMPORTA TU LOGO AQUÍ ---
// Reemplaza 'react.svg' por el nombre de tu archivo (ej: 'mi-logo.png')
import companyLogo from '../assets/LogoAhijuna.png'; 


function ServiceCalculator() {

    // --- LÓGICA / ESTADO ---
    // (Toda tu lógica de Hooks... sin cambios)
    const { clientData, issuerData, handleClientChange, handleIssuerChange } = useQuoteData();
    const { catalogServices, modalState, catalogActions } = useCatalogManager();
    const {
        services,
        total,
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

    // --- Handlers (Funciones "puente") ---
    // (Todas las funciones handle... sin cambios)
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

    // ---  PASO 2: MODIFICA handleGeneratePDF  ---
    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        // --- 1. AÑADIR EL LOGO ---
        // doc.addImage(imagen, 'FORMATO', X, Y, Ancho, Alto)
        // (Asegúrate de que el formato 'PNG', 'JPEG' o 'SVG' sea el correcto)
        doc.addImage(companyLogo, 'SVG', 14, 15, 30, 30); // 30x30px en la esquina superior izquierda

        // --- 2. AJUSTAR COORDENADAS (MOVER TODO HACIA ABAJO) ---
        // Movimos todo 40px hacia abajo para dar espacio al logo (ej: 20 -> 60)
        
        // 1. Datos Cliente/Emisor
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DE:', 14, 60); // Estaba en 20
        doc.setFont('helvetica', 'normal');
        doc.text(issuerData.name || '(Tu Nombre)', 14, 66); // Estaba en 26
        doc.text(issuerData.company || '(Tu Empresa)', 14, 72); // Estaba en 32
        doc.text(issuerData.email || '(Tu Email)', 14, 78); // Estaba en 38

        doc.setFont('helvetica', 'bold');
        doc.text('PARA:', 105, 60); // Estaba en 20
        doc.setFont('helvetica', 'normal');
        doc.text(clientData.name || '(Nombre Cliente)', 105, 66); // Estaba en 26
        doc.text(clientData.company || '(Empresa Cliente)', 105, 72); // Estaba en 32
        doc.text(clientData.email || '(Email Cliente)', 105, 78); // Estaba en 38

        // 2. Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 95, { align: 'center' }); // Estaba en 55
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 101, { align: 'center' }); // Estaba en 61

        // 3. Tabla de Servicios (lógica sin cambios)
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
        
        // --- 3. AJUSTAR INICIO DE LA TABLA ---
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 110 // Estaba en 70
        });

        // 4. Total y Métodos de Pago (sin cambios, se ajusta solo)
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${total.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
        if (issuerData.paymentMethods) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Métodos de Pago:', 14, finalY + 25);
            doc.setFont('helvetica', 'normal');
            const paymentLines = doc.splitTextToSize(issuerData.paymentMethods, 180);
            doc.text(paymentLines, 14, finalY + 31);
        }
        
        doc.save('presupuesto-servicios.pdf');
    };

    // --- Estilos ---
    // (Sin cambios)
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
        total: {
            textAlign: 'right',
            marginTop: '20px',
            color: '#28a745',
            fontSize: '24px',
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

    // --- RENDERIZADO ---
    // (El JSX/return no cambia en absoluto)
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

            <h2 style={styles.total}>
                Total: ${total.toFixed(2)}
            </h2>
            
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