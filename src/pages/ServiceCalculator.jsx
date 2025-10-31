// src/pages/ServiceCalculator.jsx

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


function ServiceCalculator() {

    // --- LÓGICA / ESTADO ---
    // (Toda tu lógica y hooks JS permanecen idénticos)
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
    // (Todas tus funciones handle... permanecen idénticas)
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
    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        
        // 1. Datos Cliente/Emisor
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DE:', 14, 20);
        doc.setFont('helvetica', 'normal');
        doc.text(issuerData.name || '(Tu Nombre)', 14, 26);
        doc.text(issuerData.company || '(Tu Empresa)', 14, 32);
        doc.text(issuerData.email || '(Tu Email)', 14, 38);
        doc.setFont('helvetica', 'bold');
        doc.text('PARA:', 105, 20);
        doc.setFont('helvetica', 'normal');
        doc.text(clientData.name || '(Nombre Cliente)', 105, 26);
        doc.text(clientData.company || '(Empresa Cliente)', 105, 32);
        doc.text(clientData.email || '(Email Cliente)', 105, 38);

        // 2. Título
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 55, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 61, { align: 'center' });

        // 3. Tabla de Servicios
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
            startY: 70
        });

        // 4. Total y Métodos de Pago
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
    // ¡YA NO NECESITAMOS EL OBJETO 'styles'!
    // Lo borramos y lo reemplazamos por clases de Tailwind.

    // --- RENDERIZADO ---
    return (
        // --- 👇 CAMBIOS AQUÍ 👇 ---
        <div className="font-sans w-[600px] mx-auto p-5 border border-gray-300 rounded-lg shadow-lg bg-white text-gray-900">
            
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

            <h2 className="text-2xl font-bold mb-4">Presupuesto de Servicios</h2>

            <button 
                onClick={catalogActions.toggleModal} 
                className="w-full p-2 bg-gray-600 text-white rounded-md cursor-pointer text-sm mb-5 hover:bg-gray-700"
            >
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

            <h2 className="text-right mt-5 text-green-600 text-2xl font-bold">
                Total: ${total.toFixed(2)}
            </h2>
            
            <button
                onClick={handleGeneratePDF}
                className="w-full p-3 bg-cyan-600 text-white rounded-md cursor-pointer text-base mt-2.5 hover:bg-cyan-700 disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                disabled={services.length === 0}
            >
                Generar Presupuesto PDF
            </button>
        </div>
        // --- 👆 FIN DE LOS CAMBIOS 👆 ---
    );
}

export default ServiceCalculator;