import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CatalogManagerModal from '../components/CatalogManagerModal';
import ServiceList from '../components/ServiceList';
import QuoteDataForms from '../components/QuoteDataForms';
import AddServiceForm from '../components/AddServiceForm';
import ConfirmModal from '../components/ConfirmModal';
import { useCatalogManager } from '../hooks/useCatalogManager';
import { useServiceManager } from '../hooks/useServiceManager';
import { useQuoteData } from '../hooks/useQuoteData';
import companyLogo from '../assets/LogoAhijuna.png';
import toast from 'react-hot-toast';

// (Funciones getTodayDateString y formatDateForPDF sin cambios)
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

// 2. Recibimos 'theme' y 'toggleTheme' como props (¡esto está bien!)
function ServiceCalculator({ theme, toggleTheme }) {
    const navigate = useNavigate(); // Hook para redirigir
    // --- Lógica de Hooks (sin el useTheme) ---
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

    // --- 3. ¡LÍNEA ELIMINADA! ---
    // const { theme, toggleTheme } = useTheme(); // <-- BORRADA (Línea 59)

    // --- Estados locales (sin cambios) ---
    const [newServiceForm, setNewServiceForm] = useState({ name: '', price: '', quantity: 1, discount: '' });
    const [advancePayment, setAdvancePayment] = useState('');
    const [quoteDate, setQuoteDate] = useState(getTodayDateString());

    // --- Handlers (sin cambios) ---
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
    const handleClearQuote = () => {
        // Pedimos confirmación
        if (window.confirm('¿Estás seguro de que quieres limpiar el presupuesto actual? Se borrarán los servicios y datos del cliente.')) {
            serviceActions.clearServices(); // Limpia la lista de servicios
            clearClientData(); // Limpia los inputs del cliente
            setAdvancePayment(''); // Resetea la seña
            setQuoteDate(getTodayDateString()); // Resetea la fecha
        }
    };
    const handleGeneratePDF = () => {
        // (La lógica del PDF no cambia)
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

    // --- Cálculos de Totales (sin cambios) ---
    const advanceAmount = parseFloat(advancePayment) || 0;
    const remainingBalance = subtotal - advanceAmount;

    const handleScheduleEvent = async () => {
        // 1. Validaciones básicas
        if (services.length === 0) return toast.error("Agrega al menos un servicio.");
        if (!clientData.name) return toast.error("Falta el nombre del cliente.");

        // 2. Verificar usuario logueado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error("Debes iniciar sesión para agendar.");

        // 3. Confirmación
        if (!confirm(`¿Agendar evento para el ${formatDateForPDF(quoteDate)}?`)) return;

        // 4. Preparar Fechas (Por defecto: 13:00 a 17:00 del día seleccionado)
        // (La calculadora solo tiene fecha, así que inventamos una hora por defecto)
        const start = new Date(`${quoteDate}T13:00:00`);
        const end = new Date(`${quoteDate}T17:00:00`);

        // 5. Guardar en Supabase
        const { error } = await supabase.from('events').insert([{
            title: `Evento: ${clientData.name}`,
            start_time: start.toISOString(),
            end_time: end.toISOString(),
            // 👇 AQUÍ ESTÁ LA CLAVE: Guardamos todo el detalle en el JSON
            client_info: {
                name: clientData.name,
                company: clientData.company,
                phone: clientData.phone,
                services: services, // Guardamos la lista de servicios
                total: subtotal,
                advance: advancePayment
            },
            user_id: user.id,
            status: advancePayment > 0 ? 'señado' : 'presupuestado' // Estado automático
        }]);

        if (error) {
            toast.error("Error al agendar: " + error.message);
        } else {
            toast.success("¡Evento agendado exitosamente!");
            // Opción de ir a la agenda
            if (confirm("Evento creado. ¿Quieres ir a la Agenda para verlo?")) {
                navigate('/eventos');
            }
        }
    };

    // --- RENDERIZADO (Migrado a Tailwind) ---
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
                <h2 className="text-3xl font-bold text-center sm:text-left">Presupuesto</h2>
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
                    {/* --- 4. El botón ahora usa las PROPS 'theme' y 'toggleTheme' --- */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors self-end"
                        title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                    >
                        {theme === 'dark' ?
                            (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>) :
                            (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>)
                        }
                    </button>
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
                                   bg-white dark:bg-gray-700 
                                   text-gray-900 dark:text-gray-100"
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
                               disableds:bg-gray-400 dark:disabled:bg-gray-700"
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