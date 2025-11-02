// src/pages/ServiceCalculator.jsx

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importar Componentes Visuales
import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';
import ConfirmModal from '../components/ConfirmModal'; // Importamos el modal de confirmación

// Importar Lógica (Hooks)
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';

// Importamos el logo
import companyLogo from '../assets/LogoAhijuna.png'; // Asegúrate que tu logo esté en /assets/

function ServiceCalculator() {

    // --- LÓGICA / ESTADO ---
    // (Toda la lógica de Hooks no cambia)
    const { clientData, issuerData, handleClientChange, handleIssuerChange } = useQuoteData();
    const { catalogServices, modalState, confirmModalState, catalogActions } = useCatalogManager();
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


    // --- Handlers (Funciones "puente") ---
    // (Todas las funciones handle... no cambian)
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
        doc.addImage(companyLogo, 'SVG', 14, 15, 30, 30);
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
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 101, { align: 'center' });
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
    // ¡BORRAMOS EL OBJETO 'styles' GIGANTE!
    // Usaremos Tailwind directamente.

    // --- Cálculos de Totales ---
    const advanceAmount = parseFloat(advancePayment) || 0;
    const remainingBalance = subtotal - advanceAmount;

    // --- RENDERIZADO (con Tailwind y Responsivo) ---
    return (
        <div className="font-sans w-full max-w-3xl mx-auto p-5 rounded-lg shadow-lg bg-white text-gray-900">
            
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
            
            <h2 className="text-3xl font-bold text-center mb-6">Presupuesto de Servicios</h2>

            <button 
                onClick={catalogActions.toggleModal} 
                className="w-full p-2 bg-gray-600 text-white rounded-md cursor-pointer text-sm mb-6 hover:bg-gray-700 transition-colors"
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

            {/* Sección de Totales (migrada a Tailwind) */}
            <div className="mt-5 border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-700">Subtotal:</span>
                    <span className="text-lg font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="advancePayment" className="text-lg font-semibold text-gray-700">
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
                        className="w-[130px] p-2 border border-gray-300 rounded-md text-right font-bold text-lg text-gray-800 bg-white"
                    />
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-2xl font-bold text-green-600">
                        Balance Pendiente:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                        ${remainingBalance.toFixed(2)}
                    </span>
                </div>
            </div>
            
            <button
                onClick={handleGeneratePDF}
                className="w-full p-3 bg-cyan-600 text-white rounded-md cursor-pointer text-lg font-medium mt-6 hover:bg-cyan-700 transition-colors disabled:bg-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
                disabled={services.length === 0}
            >
                Generar Presupuesto PDF
            </button>
        </div>
    );
}

export default ServiceCalculator;