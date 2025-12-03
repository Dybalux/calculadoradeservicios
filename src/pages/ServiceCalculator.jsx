// src/pages/ServiceCalculator.jsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';

import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';
import ConfirmModal from '../components/ConfirmModal';
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';
import companyLogo from '../assets/LogoAhijuna.png';

const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDateForPDF = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    try {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    } catch (e) {
        return dateString;
    }
};

function ServiceCalculator({ theme, toggleTheme }) {
    const navigate = useNavigate();
    const { clientData, issuerData, handleClientChange, handleIssuerChange, clearClientData } = useQuoteData();
    const { catalogServices, modalState, confirmModalState, catalogActions } = useCatalogManager();
    const {
        services,
        total: subtotal,
        editingId,
        editForm,
        setEditForm,
        actions: serviceActions
    } = useServiceManager();

    const [newServiceForm, setNewServiceForm] = useState({ name: '', price: '', quantity: 1, discount: '' });
    const [advancePayment, setAdvancePayment] = useState('');
    const [quoteDate, setQuoteDate] = useState(getTodayDateString());
    const [taxPercent, setTaxPercent] = useState('');

    // --- FUNCIÓN INTERNA PARA GUARDAR EN SUPABASE ---
    // Esta función se llamará SOLO cuando el usuario confirme en el toast
    const performScheduleEvent = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Debes iniciar sesión para agendar.");

        const start = new Date(`${quoteDate}T13:00:00`);
        const end = new Date(`${quoteDate}T17:00:00`);

        const { error } = await supabase.from('events').insert([{
            title: `Evento: ${clientData.name}`,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            client_info: {
                name: clientData.name,
                company: clientData.company,
                phone: clientData.phone,
                services: services,
                total: subtotal,
                advance: advancePayment
            },
            user_id: user.id,
            status: advancePayment > 0 ? 'señado' : 'presupuestado'
        }]);

        if (error) {
            toast.error("Error al agendar: " + error.message);
        } else {
            toast.success("¡Evento agendado exitosamente!");

            // Preguntar si quiere ir a la agenda (con otro toast para ser consistentes)
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <span>Evento creado. ¿Ir a la Agenda?</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => { toast.dismiss(t.id); navigate('/eventos'); }}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Ir a Agenda
                        </button>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                        >
                            Quedarse
                        </button>
                    </div>
                </div>
            ), { duration: 5000 });
        }
    };

    // --- HANDLER DEL BOTÓN "RESERVAR FECHA" ---
    const handleScheduleEvent = async () => {
        if (services.length === 0) return toast.error("Agrega al menos un servicio.");
        if (!clientData.name) return toast.error("Falta el nombre del cliente.");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Debes iniciar sesión para agendar.");

        // 👇 AQUI ESTA EL CAMBIO: Usamos toast custom en vez de confirm()
        toast((t) => (
            <div className="flex flex-col items-center gap-3 min-w-[250px]">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-center">
                    ¿Agendar evento para el {formatDateForPDF(quoteDate)}?
                </p>
                <div className="flex gap-3">
                    <button
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-gray-800 dark:text-white transition"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                    <button
                        className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition shadow-sm"
                        onClick={() => {
                            toast.dismiss(t.id);
                            performScheduleEvent(); // Llamamos a la función real
                        }}
                    >
                        Sí, Agendar
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

    // --- HANDLER DEL BOTÓN "LIMPIAR" ---
    const handleClearQuote = () => {
        // 👇 TAMBIÉN ACTUALIZAMOS ESTE para usar toast
        toast((t) => (
            <div className="flex flex-col items-center gap-3 min-w-[250px]">
                <p className="font-semibold text-gray-800 dark:text-gray-200 text-center">
                    ¿Limpiar todo el presupuesto?
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
                            serviceActions.clearServices();
                            clearClientData();
                            setAdvancePayment('');
                            setQuoteDate(getTodayDateString());
                            toast.dismiss(t.id);
                            toast.success("Presupuesto limpiado");
                        }}
                    >
                        Sí, Limpiar
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            className: "dark:bg-gray-800 dark:text-white"
        });
    };

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
        doc.addImage(companyLogo, 'PNG', 14, 15, 30, 30);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('DE:', 14, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(issuerData.name || '(Tu Nombre)', 14, 66);
        doc.text(issuerData.company || '(Tu Empresa)', 14, 72);
        doc.text(issuerData.phone || '(Tu Celular)', 14, 78);

        doc.setFont('helvetica', 'bold');
        doc.text('PARA:', 105, 60);
        doc.setFont('helvetica', 'normal');
        doc.text(clientData.name || '(Nombre Cliente)', 105, 66);
        doc.text(clientData.company || '(Empresa Cliente)', 105, 72);
        doc.text(clientData.phone || '(Celular Cliente)', 105, 78);

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 95, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
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

        const taxAmountPDF = (subtotal * (parseFloat(taxPercent) || 0)) / 100;
        const totalWithTaxPDF = subtotal + taxAmountPDF;
        const advanceAmountPDF = parseFloat(advancePayment) || 0;
        const remainingBalancePDF = totalWithTaxPDF - advanceAmountPDF;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        let currentY = finalY + 15;
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 196, currentY, { align: 'right' });

        if (taxAmountPDF > 0) {
            currentY += 7;
            doc.text(`IVA (${taxPercent}%): $${taxAmountPDF.toFixed(2)}`, 196, currentY, { align: 'right' });
        }

        currentY += 7;
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${totalWithTaxPDF.toFixed(2)}`, 196, currentY, { align: 'right' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        if (advanceAmountPDF > 0) {
            currentY += 7;
            doc.text(`Seña: -$${advanceAmountPDF.toFixed(2)}`, 196, currentY, { align: 'right' });
        }

        currentY += 8;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Balance Pendiente: $${remainingBalancePDF.toFixed(2)}`, 196, currentY, { align: 'right' });

        if (issuerData.paymentMethods) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Métodos de Pago:', 14, finalY + 40);
            doc.setFont('helvetica', 'normal');
            const paymentLines = doc.splitTextToSize(issuerData.paymentMethods, 180);
            doc.text(paymentLines, 14, finalY + 46);
        }

        const fileName = `presupuesto_${(clientData.name || 'cliente').replace(/ /g, '_')}.pdf`;
        doc.save(fileName);
    };

    const taxAmount = (subtotal * (parseFloat(taxPercent) || 0)) / 100;
    const totalWithTax = subtotal + taxAmount;
    const advanceAmount = parseFloat(advancePayment) || 0;
    const remainingBalance = totalWithTax - advanceAmount;

    return (
        <div className="font-sans w-full max-w-3xl mx-auto p-5 sm:p-6 rounded-lg shadow-xl 
                      bg-white dark:bg-gray-800 
                      text-gray-900 dark:text-gray-100 
                      transition-colors duration-200"
        >
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

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🧮</span> Calculadora
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Genera presupuestos profesionales</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="flex flex-col">
                        <label htmlFor="quoteDate" className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                            Fecha:
                        </label>
                        <input
                            id="quoteDate"
                            type="date"
                            value={quoteDate}
                            onChange={(e) => setQuoteDate(e.target.value)}
                            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm 
                                       bg-white dark:bg-gray-700 
                                       text-gray-900 dark:text-gray-100"
                        />
                    </div>
                </div>
            </div>

            <button
                onClick={catalogActions.toggleModal}
                className="w-full p-2 bg-gray-500 text-white rounded-md cursor-pointer text-sm mb-6 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
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

            <div className="mt-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Subtotal:</span>
                    <span className="text-lg font-bold text-gray-800 dark:text-gray-100">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="taxPercent" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        IVA (%):
                    </label>
                    <input
                        id="taxPercent"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={taxPercent}
                        onChange={(e) => setTaxPercent(e.target.value)}
                        className="w-[130px] p-2 border border-gray-300 dark:border-gray-600 rounded-md text-right font-bold text-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="flex justify-between items-center mb-2">
                    <label htmlFor="advancePayment" className="text-lg font-semibold text-gray-700 dark:text-gray-300">
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
                        className="w-[130px] p-2 border border-gray-300 dark:border-gray-600 rounded-md text-right font-bold text-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                        Balance Pendiente:
                    </span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-500">
                        ${remainingBalance.toFixed(2)}
                    </span>
                </div>
            </div>

            <button
                onClick={handleGeneratePDF}
                className="w-full p-3 bg-cyan-600 text-white rounded-md cursor-pointer text-lg font-medium mt-6 
                           hover:bg-cyan-700 
                           disabled:bg-gray-400 dark:disabled:bg-gray-600 
                           disabled:text-gray-600 dark:disabled:text-gray-400 
                           disabled:cursor-not-allowed transition-colors"
                disabled={services.length === 0}
            >
                Generar Presupuesto PDF
            </button>

            <div className="flex gap-2 mt-3">
                <button
                    onClick={handleScheduleEvent}
                    className="flex-1 p-3 bg-indigo-600 text-white rounded-md cursor-pointer text-base font-medium 
                               hover:bg-indigo-700 transition-colors shadow-sm
                               disabled:bg-gray-400 dark:disabled:bg-gray-700"
                    disabled={services.length === 0}
                >
                    📅 Reservar Fecha en Agenda
                </button>

                <button
                    onClick={handleClearQuote}
                    className="w-1/3 p-3 bg-gray-500 text-white rounded-md cursor-pointer text-base font-medium 
                               hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                    disabled={services.length === 0 && clientData.name === ''}
                >
                    Limpiar
                </button>
            </div>
        </div>
    );
}

export default ServiceCalculator;