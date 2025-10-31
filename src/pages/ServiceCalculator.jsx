import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- NUEVO: Definimos las "llaves" que usaremos en localStorage
const SERVICES_STORAGE_KEY = 'calculator_services';
const ISSUER_STORAGE_KEY = 'calculator_issuer_data';

// --- NUEVO: Función para asegurar que los datos del emisor tengan todos los campos
const getInitialIssuerData = () => {
    try {
        const savedIssuer = localStorage.getItem(ISSUER_STORAGE_KEY);
        const parsedIssuer = savedIssuer ? JSON.parse(savedIssuer) : {};

        // Fusionamos los datos guardados con los valores por defecto
        // Esto asegura que 'paymentMethods' exista, incluso si el usuario
        // tenía datos guardados de la versión anterior.
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
    // Cargamos los servicios desde localStorage al iniciar
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
    // --- NUEVO: Estado para el descuento del nuevo servicio (string, para el input)
    const [serviceDiscount, setServiceDiscount] = useState('');

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editQuantity, setEditQuantity] = useState(1);
    // --- NUEVO: Estado para el descuento en modo edición
    const [editDiscount, setEditDiscount] = useState('');
    // --- NUEVO: Estados para los datos del cliente y emisor
    const [clientData, setClientData] = useState({
        name: '',
        company: '',
        email: ''
    });
    // --- MODIFICADO: Cargamos los datos del EMISOR desde localStorage
    const [issuerData, setIssuerData] = useState(getInitialIssuerData);

    // --- Efectos (para guardar en localStorage) ---

    useEffect(() => {
        // --- MODIFICADO: Aseguramos que 'discount' exista
        // Esto da compatibilidad si el usuario guardó servicios sin descuento
        const servicesWithDefaults = services.map(s => ({
            ...s,
            discount: s.discount || 0
        }));
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(servicesWithDefaults));
    }, [services]);

    //Guardar 'issuerData' en localStorage cada vez que cambie
    useEffect(() => {
        localStorage.setItem(ISSUER_STORAGE_KEY, JSON.stringify(issuerData));
    }, [issuerData]); // Se ejecuta cuando 'issuerData' se actualiza


    // --- Funciones (Manejadores de Eventos) ---
    /**
     * Se llama cuando se envía el formulario (al hacer clic en "Agregar" o presionar Enter).
     */
    const handleAddService = (e) => {
        e.preventDefault();
        const price = parseFloat(servicePrice);
        const quantity = parseInt(serviceQuantity, 10); // Convertimos a entero
        const discount = parseFloat(serviceDiscount) || 0;

        // --- MODIFICADO: Validación incluye cantidad
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
        setServiceDiscount(''); // --- NUEVO: Reseteamos el descuento
    };

    /**
     * Se llama cuando se hace clic en el botón "Eliminar" de un servicio.
     * Recibe el 'id' del servicio que queremos borrar.
     */
    const handleDeleteService = (idToDelete) => {
        setServices(services.filter(service => service.id !== idToDelete));
    };

    // --- MODIFICADO: Carga también la cantidad al editar
    const handleEditClick = (service) => {
        setEditingId(service.id);
        setEditName(service.name);
        setEditPrice(service.price.toString());
        setEditQuantity(service.quantity.toString());
        // --- NUEVO: Carga el descuento (o 0 si no existe)
        setEditDiscount((service.discount || 0).toString());
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    // --- MODIFICADO: Guarda también la cantidad
    const handleSaveEdit = (idToSave) => {
        const price = parseFloat(editPrice);
        const quantity = parseInt(editQuantity, 10);
        const discount = parseFloat(editDiscount) || 0; // --- NUEVO

        if (editName.trim() === '' || isNaN(price) || price <= 0 || isNaN(quantity) || quantity <= 0) {
            alert('Por favor, ingresa nombre, precio positivo y cantidad positiva.');
            return;
        }

        const updatedServices = services.map(service => {
            if (service.id === idToSave) {
                // --- MODIFICADO: Actualiza precio, cantidad y descuento
                return { ...service, name: editName.trim(), price: price, quantity: quantity, discount: discount };
            }
            return service;
        });

        setServices(updatedServices);
        setEditingId(null);
    };
    // --- NUEVO: Manejadores para los formularios de datos
    const handleClientChange = (e) => {
        // [e.target.name] usa el 'name' del input (ej: "name", "company") como llave
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleIssuerChange = (e) => {
        setIssuerData({ ...issuerData, [e.target.name]: e.target.value });
    };
    const handleGeneratePDF = () => {
        const doc = new jsPDF();

        // --- NUEVO: Sección de Datos (Emisor y Cliente)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');

        // Columna Izquierda: Emisor (Mis Datos)
        // Asegúrate de que 'issuerData' exista (ej: desde un useState)
        doc.text('DE:', 14, 20);
        doc.setFont('helvetica', 'normal');
        doc.text(issuerData.name || '(Tu Nombre)', 14, 26);
        doc.text(issuerData.company || '(Tu Empresa)', 14, 32);
        doc.text(issuerData.email || '(Tu Email)', 14, 38);

        // Columna Derecha: Cliente
        // Asegúrate de que 'clientData' exista (ej: desde un useState)
        doc.setFont('helvetica', 'bold');
        doc.text('PARA:', 105, 20);
        doc.setFont('helvetica', 'normal');
        doc.text(clientData.name || '(Nombre Cliente)', 105, 26);
        doc.text(clientData.company || '(Empresa Cliente)', 105, 32);
        doc.text(clientData.email || '(Email Cliente)', 105, 38);

        // --- NUEVO: Título principal y Fecha
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Presupuesto de Servicios', 105, 55, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 61, { align: 'center' });


        // --- MODIFICADO: Columnas de la tabla (incluye Desc. %)
        const tableColumn = ["Servicio", "Cant.", "P. Unit. ($)", "Desc. %", "Subtotal ($)"];
        const tableRows = [];

        // --- MODIFICADO: Filas de la tabla
        services.forEach(service => {
            const discount = service.discount || 0;
            const baseSubtotal = service.price * service.quantity;
            const discountAmount = baseSubtotal * (discount / 100);
            const finalSubtotal = baseSubtotal - discountAmount;

            const serviceData = [
                service.name,
                service.quantity,
                service.price.toFixed(2),
                `${discount}%`, // Mostramos el descuento
                finalSubtotal.toFixed(2) // Subtotal con descuento
            ];
            tableRows.push(serviceData);
        });

        // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
        // Usamos la función autoTable() importada
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 70
        });
        // --- Fin de la corrección ---

        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        // El 'total' (calculado abajo) ya incluye las cantidades
        doc.text(`Total: $${total.toFixed(2)}`, 196, finalY + 15, { align: 'right' });
        // --- NUEVO: Sección de Métodos de Pago
        if (issuerData.paymentMethods) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Métodos de Pago:', 14, finalY + 25);

            doc.setFont('helvetica', 'normal');
            // 'splitTextToSize' maneja saltos de línea automáticamente
            const paymentLines = doc.splitTextToSize(issuerData.paymentMethods, 180);
            doc.text(paymentLines, 14, finalY + 31);
        }
        doc.save('presupuesto-servicios.pdf');
    };

    // --- Cálculos (Valores Derivados) ---

    // Calculamos el total.
    // --- MODIFICADO: El total ahora resta el descuento
    const total = services.reduce((accumulator, service) => {
        const discount = service.discount || 0;
        const baseSubtotal = service.price * service.quantity;
        const discountAmount = baseSubtotal * (discount / 100);
        const finalSubtotal = baseSubtotal - discountAmount;
        return accumulator + finalSubtotal;
    }, 0);

    // --- Estilos ---
    const styles = {
        calculatorContainer: {
            fontFamily: 'Arial, sans-serif',
            width: '600px', // --- MODIFICADO: Más ancho
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        },
        // --- NUEVO: Estilos para los formularios de datos
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
            color: 'black',      // Un color oscuro para el texto
            marginTop: 0,          // Quita el margen superior por defecto del h3
            marginBottom: '15px'
        },
        dataInput: {
            width: 'calc(100% - 16px)', // Ajuste para padding
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '5px',
        },
        // --- NUEVO: Estilo para el textarea
        textareaInput: {
            width: 'calc(100% - 16px)',
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontFamily: 'Arial, sans-serif',
            resize: 'vertical', // Permite al usuario ajustar la altura
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
            // --- 👇 CORRECCIÓN 1 ---
            minWidth: 0, // Permite que el input se encoja más allá de su
                         // contenido (placeholder)
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
        listTitle: {
            borderBottom: '1px solid #eee',
            paddingBottom: '5px',
            marginTop: '20px'
        },
        serviceList: {
            listStyleType: 'none',
            padding: 0,
            minHeight: '50px' // Evita que salte la UI
        },
        serviceItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 5px',
            borderBottom: '1px solid #f0f0f0',
            gap: '5px',
        },
        // --- NUEVO: Estilo para la "etiqueta" de descuento
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
            // --- 👇 CORRECCIÓN 2 ---
            minWidth: 0, // Misma corrección para el input de nombre en modo edición
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
        }
    };

    // --- Renderizado ---
    return (
        <div style={styles.calculatorContainer}>
            <h2>Presupuesto de Servicios</h2>

            {/* --- NUEVO: Formularios de Datos Cliente/Emisor --- */}
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
                    {/* --- NUEVO: Textarea para Métodos de Pago --- */}
                    <textarea
                        name="paymentMethods"
                        placeholder="Métodos de pago (ej: CBU, Alias, etc.)"
                        value={issuerData.paymentMethods}
                        onChange={handleIssuerChange}
                        style={styles.textareaInput}
                        rows={3}
                    />
                </div>
            </div>

            {/* Formulario para agregar nuevos servicios */}
            <h3 style={styles.listTitle}>Agregar Servicio</h3>
            <form onSubmit={handleAddService} style={styles.form}>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Nombre del Servicio"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        style={{ ...styles.input, flex: 3 }} // Más espacio para el nombre
                    />
                    {/* --- NUEVO: Input de Cantidad --- */}
                    <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Cant."
                        value={serviceQuantity}
                        onChange={(e) => setServiceQuantity(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                    />
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        style={{ ...styles.input, flex: 1.5 }}
                    />
                    {/* --- NUEVO: Input de Descuento --- */}
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Desc. %"
                        value={serviceDiscount}
                        onChange={(e) => setServiceDiscount(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Agregar Servicio
                </button>
            </form>

            {/* Lista de servicios agregados */}
            <h3 style={styles.listTitle}>Servicios Agregados:</h3>
            <ul style={styles.serviceList}>
                {services.map((service) => (
                    // --- 👇 CORRECCIÓN 3 ---
                    // Aplicamos un estilo condicional al 'li'.
                    // Si editamos, usamos 'flex-start' para alinear todo al inicio.
                    // Si no, usamos 'space-between' para que se vea como antes.
                    <li 
                        key={service.id} 
                        style={{ 
                            ...styles.serviceItem, 
                            justifyContent: editingId === service.id ? 'flex-start' : 'space-between' 
                        }}
                    >
                        {editingId === service.id ? (
                            // --- Modo Edición (MODIFICADO) ---
                            <>
                                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ ...styles.editInput, flex: 2 }} />
                                <input type="number" min="1" step="1" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                                <input type="number" min="0.01" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ ...styles.editInputPrice, width: '70px' }} />
                                {/* --- NUEVO: Input de Descuento en Edición --- */}
                                <input type="number" min="0" max="100" placeholder="%" value={editDiscount} onChange={(e) => setEditDiscount(e.target.value)} style={{ ...styles.editInputPrice, width: '50px' }} />
                                <button onClick={() => handleSaveEdit(service.id)} style={styles.saveButton}>Guardar</button>
                                <button onClick={handleCancelEdit} style={styles.cancelButton}>X</button>
                            </>
                        ) : (
                            // --- Modo Visualización (MODIFICADO) ---
                            <>
                                <span style={{ flex: 1 }}>
                                    {service.name} (x{service.quantity})
                                    {/* --- NUEVO: Muestra el descuento si es mayor a 0 --- */}
                                    {(service.discount || 0) > 0 && (
                                        <span style={styles.discountBadge}>-{service.discount}%</span>
                                    )}
                                </span>
                                <span style={{ width: '100px', textAlign: 'right' }}>
                                    {/* Muestra el subtotal con descuento */}
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

            {/* Total Final */}
            <h2 style={styles.total}>
                Total: ${total.toFixed(2)}
            </h2>

            {/* Botón de PDF */}
            <button
                onClick={handleGeneratePDF}
                style={services.length > 0 ? styles.pdfButton : styles.pdfButtonDisabled}
                disabled={services.length === 0}
            >
                Generar Presupuesto PDF
            </button>
        </div>
    );

};

export default ServiceCalculator;
