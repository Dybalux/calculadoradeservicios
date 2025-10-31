import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- NUEVO: Llave para el catálogo de servicios
const CATALOG_SERVICES_STORAGE_KEY = 'calculator_catalog_services';
const SERVICES_STORAGE_KEY = 'calculator_services';
const ISSUER_STORAGE_KEY = 'calculator_issuer_data';

// --- NUEVO: Función para asegurar que los datos del emisor tengan todos los campos
const getInitialIssuerData = () => {
    try {
        const savedIssuer = localStorage.getItem(ISSUER_STORAGE_KEY);
        const parsedIssuer = savedIssuer ? JSON.parse(savedIssuer) : {};

        // Fusionamos los datos guardados con los valores por defecto
        return {
            name: '',
            company: '',
            email: '',
            paymentMethods: '', // --- NUEVO CAMPO
            ...parsedIssuer // Los datos guardados sobrescriben los defaults
        };
    } catch (error) {
        console.error("Error al cargar datos del emisor", error);
        return { name: '', company: '', email: '', paymentMethods: '' };
    }
};

function ServiceCalculator() {

    // --- Estados ---
    // (Sin cambios)
    const [services, setServices] = useState(() => {
        try {
            const savedServices = localStorage.getItem(SERVICES_STORAGE_KEY);
            return savedServices ? JSON.parse(savedServices) : [];
        } catch (error) {
            return [];
        }
    });
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');
    const [serviceQuantity, setServiceQuantity] = useState(1);
    const [serviceDiscount, setServiceDiscount] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editQuantity, setEditQuantity] = useState(1);
    const [editDiscount, setEditDiscount] = useState('');
    const [clientData, setClientData] = useState({
        name: '',
        company: '',
        email: ''
    });
    const [issuerData, setIssuerData] = useState(getInitialIssuerData);

    const [catalogServices, setCatalogServices] = useState(() => {
        try {
            const savedCatalog = localStorage.getItem(CATALOG_SERVICES_STORAGE_KEY);
            return savedCatalog ? JSON.parse(savedCatalog) : [];
        } catch (error) {
            return [];
        }
    });
    const [showCatalogManager, setShowCatalogManager] = useState(false);
    const [catalogForm, setCatalogForm] = useState({ name: '', price: '', discount: '' });
    const [editingCatalogId, setEditingCatalogId] = useState(null);
    const [isSavingCatalog, setIsSavingCatalog] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);


    // --- Efectos (para guardar en localStorage) ---
    // (Sin cambios)
    useEffect(() => {
        const servicesWithDefaults = services.map(s => ({
            ...s,
            discount: s.discount || 0
        }));
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesWithDefaults));
    }, [services]);

    useEffect(() => {
        localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(issuerData));
    }, [issuerData]); 

    useEffect(() => {
        localStorage.setItem(CATALOG_SERVICES_STORAGE_KEY, JSON.stringify(catalogServices));
    }, [catalogServices]);


    // --- Funciones (Manejadores de Eventos) ---
    // (Todas las funciones lógicas van aquí, sin cambios)
    const handleAddService = (e) => {
        e.preventDefault();
        const price = parseFloat(servicePrice);
        const quantity = parseInt(serviceQuantity, 10);
        const discount = parseFloat(serviceDiscount) || 0;
        if (serviceName.trim() === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa nombre, precio positivo y cantidad positiva.');
            return;
        }
        const newService = {
            id: Date.now(),
            name: serviceName.trim(),
            price: price,
            quantity: quantity,
            discount: discount
        };
        setServices([...services, newService]);
        setServiceName('');
        setServicePrice('');
        setServiceQuantity(1);
        setServiceDiscount('');
    };
    const handleDeleteService = (idToDelete) => {
        setServices(services.filter(service => service.id !== idToDelete));
    };
    const handleEditClick = (service) => {
        setEditingId(service.id);
        setEditName(service.name);
        setEditPrice(service.price.toString());
        setEditQuantity(service.quantity.toString());
        setEditDiscount((service.discount || 0).toString());
    };
    const handleCancelEdit = () => {
        setEditingId(null);
    };
    const handleSaveEdit = (idToSave) => {
        const price = parseFloat(editPrice);
        const quantity = parseInt(editQuantity, 10);
        const discount = parseFloat(editDiscount) || 0;
        if (editName.trim() === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa nombre, precio positivo y cantidad positiva.');
            return;
        }
        const updatedServices = services.map(service => {
            if (service.id === idToSave) {
                return { ...service, name: editName.trim(), price: price, quantity: quantity, discount: discount };
            }
            return service;
        });
        setServices(updatedServices);
        setEditingId(null);
    };
    const handleClientChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };
    const handleIssuerChange = (e) => {
        setIssuerData({ ...issuerData, [e.target.name]: e.target.value });
    };
    const handleCatalogSelect = (e) => {
        const catalogId = e.target.value;
        if (!catalogId) {
            setServiceName('');
            setServicePrice('');
            setServiceDiscount('');
            return;
        }
        const serviceToLoad = catalogServices.find(s => s.id === parseInt(catalogId, 10));
        if (serviceToLoad) {
            setServiceName(serviceToLoad.name);
            setServicePrice(serviceToLoad.price.toString());
            setServiceDiscount((serviceToLoad.discount || 0).toString());
        }
    };
    const handleToggleCatalog = () => {
        setShowCatalogManager(!showCatalogManager);
        setEditingCatalogId(null);
        setCatalogForm({ name: '', price: '', discount: '' });
    };
    const handleCatalogFormChange = (e) => {
        setCatalogForm({ ...catalogForm, [e.target.name]: e.target.value });
    };
    const handleCatalogSubmit = (e) => {
        e.preventDefault();
        const price = parseFloat(catalogForm.price);
        const discount = parseFloat(catalogForm.discount) || 0;
        if (catalogForm.name.trim() === '' || isNaN(price) || price <= 0) {
            alert('Por favor, ingresa un nombre y precio válido.');
            return;
        }
        setIsSavingCatalog(true);
        setSaveSuccess(false);
        setTimeout(() => {
            if (editingCatalogId) {
                setCatalogServices(
                    catalogServices.map(s =>
                        s.id === editingCatalogId
                            ? { ...s, name: catalogForm.name.trim(), price: price, discount: discount }
                            : s
                    )
                );
            } else {
                const newCatalogService = {
                    id: Date.now(),
                    name: catalogForm.name.trim(),
                    price: price,
                    discount: discount
                };
                setCatalogServices([...catalogServices, newCatalogService]);
            }
            setEditingCatalogId(null);
            setCatalogForm({ name: '', price: '', discount: '' });
            setIsSavingCatalog(false);
            setSaveSuccess(true);
            setTimeout(() => {
                setSaveSuccess(false);
            }, 1500);
        }, 1000);
    };
    const handleCatalogEditClick = (service) => {
        setEditingCatalogId(service.id);
        setCatalogForm({
            name: service.name,
            price: service.price.toString(),
            discount: (service.discount || 0).toString()
        });
    };
    const handleCatalogDelete = (idToDelete) => {
        if (window.confirm('¿Seguro que quieres eliminar este servicio de tu catálogo?')) {
            setCatalogServices(catalogServices.filter(s => s.id !== idToDelete));
        }
    };
    const handleGeneratePDF = () => {
        const doc = new jsPDF();
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
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 55, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 61, { align: 'center' });
        const tableColumn = ["Servicio", "Cant.", "P. Unit. ($)", "Desc. %", "Subtotal ($)"];
        const tableRows = [];
        services.forEach(service => {
            const discount = service.discount || 0;
            const baseSubtotal = service.price * service.quantity;
            const discountAmount = baseSubtotal * (discount / 100);
            const finalSubtotal = baseSubtotal - discountAmount;
            const serviceData = [
                service.name,
                service.quantity,
                service.price.toFixed(2),
                `${discount}%`,
                finalSubtotal.toFixed(2)
            ];
            tableRows.push(serviceData);
        });
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70
        });
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

    // --- Cálculos (Valores Derivados) ---
    // (Sin cambios)
    const total = services.reduce((accumulator, service) => {
        const discount = service.discount || 0;
        const baseSubtotal = service.price * service.quantity;
        const discountAmount = baseSubtotal * (discount / 100);
        const finalSubtotal = baseSubtotal - discountAmount;
        return accumulator + finalSubtotal;
    }, 0);

    // --- Estilos ---
    const styles = {
        // (Estilos principales sin cambios)
        calculatorContainer: {
            fontFamily: 'Arial, sans-serif',
            width: '600px',
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        },
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
            backgroundColor: '#ffffff', // Arreglo inputs
            color: '#213547',          // Arreglo inputs
        },
        textareaInput: {
            width: 'calc(100% - 16px)',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'Arial, sans-serif',
            resize: 'vertical',
            backgroundColor: '#ffffff', // Arreglo inputs
            color: '#213547',          // Arreglo inputs
        },
        form: {
            marginBottom: '20px',
        },
        inputGroup: {
            display: 'flex',
            gap: '10px',
            marginBottom: '10px',
        },
        input: {
            flex: '1',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: 0,
            backgroundColor: '#ffffff', // Arreglo inputs
            color: '#213547',          // Arreglo inputs
        },
        button: {
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
        },
        buttonLoading: {
            width: '100%',
            padding: '10px',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            backgroundColor: '#ff9900',
            cursor: 'wait',
            boxSizing: 'border-box', // Arreglo 'this'
        },
        buttonSuccess: {
            width: '100%',
            padding: '10px',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#28a745',
            boxSizing: 'border-box', // Arreglo 'this'
        },
        spinner: {
            display: 'inline-block',
            width: '16px',
            height: '16px',
            border: '3px solid rgba(255,255,255,.3)',
            borderRadius: '50%',
            borderTopColor: '#ffffff',
            animation: 'spin 1s linear infinite',
            marginRight: '8px',
            verticalAlign: 'middle',
        },
        // (Estilos de lista, etc. sin cambios)
        listTitle: {
            borderBottom: '1px solid #eee',
            paddingBottom: '5px',
            marginTop: '20px'
        },
        serviceList: {
            listStyleType: 'none',
            padding: 0,
            minHeight: '50px'
        },
        serviceItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 5px',
            borderBottom: '1px solid #f0f0f0',
            gap: '5px',
        },
        discountBadge: {
            backgroundColor: '#28a745',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: '10px',
            marginLeft: '8px',
            fontWeight: 'bold',
        },
        editInput: {
            flex: '1',
            padding: '6px',
            border: '1px solid #007bff',
            borderRadius: '4px',
            minWidth: 0,
        },
        editInputPrice: {
            width: '80px',
            padding: '6px',
            border: '1px solid #007bff',
            borderRadius: '4px',
        },
        editButton: {
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
        },
        deleteButton: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
            marginLeft: '5px',
        },
        saveButton: {
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
        },
        cancelButton: {
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
            marginLeft: '5px',
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
        
        // --- 👇👇 CAMBIOS EN LOS ESTILOS DEL MODAL 👇👇 ---
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
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modalContent: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            color: '#213547',
        },
        
        // --- MODIFICADO ---
        catalogForm: {
            display: 'block', // Cambiado de 'flex' a 'block'
            marginBottom: '20px',
        },
        
        // --- NUEVOS ESTILOS ---
        modalInputGroup: {
            marginBottom: '15px', // Espacio entre campos
        },
        modalLabel: {
            display: 'block',
            fontWeight: 'bold',
            marginBottom: '5px',
            fontSize: '14px',
            color: '#333333',
        },
        modalInput: {
            // Copia de styles.input PERO sin 'flex: 1'
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            minWidth: 0,
            backgroundColor: '#ffffff',
            color: '#213547',
            // Añadimos esto para que ocupe el 100%
            width: '100%',
            boxSizing: 'border-box', // Para que el width 100% incluya padding y borde
        },
        // --- FIN DE CAMBIOS DE ESTILO ---

        catalogList: {
            listStyleType: 'none',
            padding: 0,
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #eee',
            borderRadius: '4px',
        },
        closeButton: {
            width: '100%',
            padding: '10px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px',
        },
        catalogSelect: {
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            marginBottom: '10px',
            backgroundColor: '#f8f9fa',
            color: '#213547', // Arreglo inputs
        }
    };

    // --- Renderizado ---
    return (
        <div style={styles.calculatorContainer}>

            {/* --- 👇👇 CAMBIOS EN EL JSX DEL MODAL 👇👇 --- */}
            {showCatalogManager && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2>Administrar Catálogo de Servicios</h2>

                        {/* Formulario de Carga/Edición MODIFICADO */}
                        <form onSubmit={handleCatalogSubmit} style={styles.catalogForm}>

                            <div style={styles.modalInputGroup}>
                                <label htmlFor="catalog_name" style={styles.modalLabel}>
                                    Nombre del Servicio:
                                </label>
                                <input
                                    id="catalog_name" // Para conectar la label
                                    name="name" 
                                    placeholder="Ej: Diseño de Logo"
                                    value={catalogForm.name} 
                                    onChange={handleCatalogFormChange}
                                    style={styles.modalInput} // Usamos el nuevo estilo
                                />
                            </div>

                            <div style={styles.modalInputGroup}>
                                <label htmlFor="catalog_price" style={styles.modalLabel}>
                                    Precio Base ($):
                                </label>
                                <input
                                    id="catalog_price"
                                    name="price" 
                                    type="number" 
                                    min="0.01" 
                                    step="0.01" 
                                    placeholder="Ej: 1500"
                                    value={catalogForm.price} 
                                    onChange={handleCatalogFormChange}
                                    style={styles.modalInput} // Usamos el nuevo estilo
                                />
                            </div>

                            <div style={styles.modalInputGroup}>
                                <label htmlFor="catalog_discount" style={styles.modalLabel}>
                                    Descuento (% Opcional):
                                </label>
                                <input
                                    id="catalog_discount"
                                    name="discount" 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    placeholder="Ej: 10"
                                    value={catalogForm.discount} 
                                    onChange={handleCatalogFormChange}
                                    style={styles.modalInput} // Usamos el nuevo estilo
                                />
                            </div>

                            {/* El botón ahora se apila verticalmente */}
                            <button 
                                type="submit"
                                style={
                                    isSavingCatalog ? styles.buttonLoading : (saveSuccess ? styles.buttonSuccess : styles.button)
                                }
                                disabled={isSavingCatalog}
                            >
                                {isSavingCatalog ? (
                                    <><span style={styles.spinner}></span> Editando...</>
                                ) : saveSuccess ? (
                                    '¡Guardado!'
                                ) : (
                                    editingCatalogId ? 'Actualizar Servicio' : 'Guardar Nuevo Servicio'
                                )}
                            </button>
                        </form>

                        {/* (El resto del modal sin cambios) */}
                        <h3 style={styles.listTitle}>Servicios Guardados</h3>
                        <ul style={styles.catalogList}>
                            {catalogServices.length === 0 && <li style={{padding: '10px'}}>No hay servicios en tu catálogo.</li>}
                            {catalogServices.map(s => (
                                <li key={s.id} style={styles.serviceItem}>
                                    <span>
                                        {s.name} (${s.price}) {(s.discount || 0) > 0 ? `(-${s.discount}%)` : ''}
                                    </span>
                                    <div>
                                        <button onClick={() => handleCatalogEditClick(s)} style={styles.editButton}>Editar</button>
                                        <button onClick={() => handleCatalogDelete(s.id)} style={styles.deleteButton}>Borrar</button>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <button onClick={handleToggleCatalog} style={styles.closeButton}>Cerrar</button>
                    </div>
                </div>
            )}
            {/* --- 👆👆 FIN DE CAMBIOS EN EL MODAL 👆👆 --- */}


            <h2>Presupuesto de Servicios</h2>

            <button onClick={handleToggleCatalog} style={styles.catalogToggleButton}>
                Administrar Catálogo de Servicios
            </button>

            {/* (Resto del JSX sin cambios) */}
            <div style={styles.dataFormsContainer}>
                <div style={styles.dataFormBox}>
                    <h3 style={styles.dataFormBoxTitle}>Datos del Cliente</h3>
                    <input name="name" placeholder="Nombre del Cliente" value={clientData.name} onChange={handleClientChange} style={styles.dataInput} />
                    <input name="company" placeholder="Empresa (Opcional)" value={clientData.company} onChange={handleClientChange} style={styles.dataInput} />
                    <input name="email" type="email" placeholder="Email (Opcional)" value={clientData.email} onChange={handleClientChange} style={styles.dataInput} />
                </div>
                <div style={styles.dataFormBox}>
                    <h3 style={styles.dataFormBoxTitle}>Mis Datos (Emisor)</h3>
                    <input name="name" placeholder="Tu Nombre" value={issuerData.name} onChange={handleIssuerChange} style={styles.dataInput} />
                    <input name="company" placeholder="Tu Empresa (Opcional)" value={issuerData.company} onChange={handleIssuerChange} style={styles.dataInput} />
                    <input name="email" type="email" placeholder="Tu Email (Opcional)" value={issuerData.email} onChange={handleIssuerChange} style={styles.dataInput} />
                    <textarea
                        name="paymentMethods" placeholder="Métodos de pago (ej: CBU, Alias, etc.)"
                        value={issuerData.paymentMethods} onChange={handleIssuerChange}
                        style={styles.textareaInput} rows={3}
                    />
                </div>
            </div>

            <h3 style={styles.listTitle}>Agregar Servicio</h3>
            <form onSubmit={handleAddService} style={styles.form}>

                <select onChange={handleCatalogSelect} style={styles.catalogSelect}>
                    <option value="">-- Cargar Servicio desde Catálogo --</option>
                    {catalogServices.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} (${s.price})
                        </option>
                    ))}
                </select>

                <div style={styles.inputGroup}>
                    <input
                        type="text" placeholder="Nombre del Servicio"
                        value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                        style={{ ...styles.input, flex: 3 }}
                    />
                    <input
                        type="number" min="1" step="1" placeholder="Cant."
                        value={serviceQuantity} onChange={(e) => setServiceQuantity(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                    />
                    <input
                        type="number" min="0.01" step="0.01" placeholder="Precio ($)"
                        value={servicePrice} onChange={(e) => setServicePrice(e.target.value)}
                        style={{ ...styles.input, flex: 1.5 }}
                    />
                    <input
                        type="number" min="0" max="100" step="1" placeholder="Desc. %"
                        value={serviceDiscount} onChange={(e) => setServiceDiscount(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Agregar Servicio
                </button>
            </form>

            <h3 style={styles.listTitle}>Servicios Agregados:</h3>
            <ul style={styles.serviceList}>
                {services.map((service) => (
                    <li key={service.id} style={{ ...styles.serviceItem, justifyContent: editingId === service.id ? 'flex-start' : 'space-between' }}>
                        {editingId === service.id ? (
                            <>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...styles.editInput, flex: 2 }} />
                                <input type="number" min="1" step="1" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                                <input type="number" min="0.01" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ ...styles.editInputPrice, width: '70px' }} />
                                <input type="number" min="0" max="100" placeholder="%" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                                <button onClick={() => handleSaveEdit(service.id)} style={styles.saveButton}>Guardar</button>
                                <button onClick={handleCancelEdit} style={styles.cancelButton}>X</button>
                            </>
                        ) : (
                            <>
                                <span style={{ flex: 1 }}>
                                    {service.name} (x{service.quantity})
                                    {(service.discount || 0) > 0 && (
                                        <span style={styles.discountBadge}>-{service.discount}%</span>
                                    )}
                                </span>
                                <span style={{ width: '100px', textAlign: 'right' }}>
                                    <strong>${((service.price * service.quantity) * (1 - (service.discount || 0) / 100)).toFixed(2)}</strong>
                                </span>
                                <div style={{ marginLeft: '10px' }}>
                                    <button onClick={() => handleEditClick(service)} style={styles.editButton}>
                                        Editar
                                    </button>
                                    <button onClick={() => handleDeleteService(service.id)} style={styles.deleteButton}>
                                        Eliminar
                                    </button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>

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