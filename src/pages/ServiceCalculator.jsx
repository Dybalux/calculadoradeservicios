import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
function ServiceCalculator() {

    // --- Estados ---

    const [services, setServices] = useState([]);
    const [serviceName, setServiceName] = useState('');
    const [servicePrice, setServicePrice] = useState('');

    // NUEVO: Estado para saber qué ID estamos editando. null = ninguno.
    const [editingId, setEditingId] = useState(null);

    // NUEVO: Estados para guardar los valores temporales de edición
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');

    // --- Funciones (Manejadores de Eventos) ---

    /**
     * Se llama cuando se envía el formulario (al hacer clic en "Agregar" o presionar Enter).
     */
    const handleAddService = (e) => {
        // Prevenimos que la página se recargue, que es el comportamiento 
        // por defecto de un formulario.
        e.preventDefault();

        // Convertimos el precio (string) a un número (flotante).
        const price = parseFloat(servicePrice);

        // Validación simple:
        // 1. Que el nombre no esté vacío (usamos .trim() para quitar espacios en blanco).
        // 2. Que el precio sea un número válido (isNaN = Is Not a Number).
        // 3. Que el precio sea mayor que 0.
        if (serviceName.trim() === '' || isNaN(price) || price <= 0) {
            alert('Por favor, ingresa un nombre válido y un precio numérico positivo.');
            return; // Detenemos la función aquí si la validación falla.
        }

        // Creamos el nuevo objeto de servicio
        const newService = {
            // Usamos Date.now() como un 'id' simple y único para poder
            // identificarlo luego (por ejemplo, para borrarlo).
            id: Date.now(),
            name: serviceName.trim(),
            price: price
        };

        // Actualizamos el estado 'services'
        // Usamos el "spread operator" (...) para crear un *nuevo* array 
        // que contiene todos los servicios antiguos MÁS el nuevo.
        setServices([...services, newService]);

        // Limpiamos los campos del formulario para el próximo ingreso
        setServiceName('');
        setServicePrice('');
    };

    /**
     * Se llama cuando se hace clic en el botón "Eliminar" de un servicio.
     * Recibe el 'id' del servicio que queremos borrar.
     */
    const handleDeleteService = (idToDelete) => {
        // Usamos .filter() para crear un *nuevo* array
        // que incluye solo los servicios cuyo 'id' NO coincide
        // con el 'id' que queremos borrar.
        const updatedServices = services.filter(service => service.id !== idToDelete);

        // Actualizamos el estado con el nuevo array filtrado.
        setServices(updatedServices);
    };

    // NUEVO: Se llama cuando haces clic en "Editar"
    const handleEditClick = (service) => {
        setEditingId(service.id); // Marcamos este ID como "en edición"
        // Cargamos sus datos actuales en los inputs de edición
        setEditName(service.name);
        setEditPrice(service.price.toString()); // El input necesita un string
    };

    // NUEVO: Se llama cuando haces clic en "Cancelar" (en modo edición)
    const handleCancelEdit = () => {
        setEditingId(null); // Dejamos de editar
        setEditName('');
        setEditPrice('');
    };

    // NUEVO: Se llama cuando haces clic en "Guardar" (en modo edición)
    const handleSaveEdit = (idToSave) => {
        const price = parseFloat(editPrice);

        // Validación (igual que al agregar)
        if (editName.trim() === '' || isNaN(price) || price <= 0) {
            alert('Por favor, ingresa un nombre válido y un precio numérico positivo.');
            return;
        }

        // Usamos .map() para crear un NUEVO array
        const updatedServices = services.map(service => {
            // Si el ID coincide, devolvemos el servicio con los datos actualizados
            if (service.id === idToSave) {
                return { ...service, name: editName.trim(), price: price };
            }
            // Si no, devolvemos el servicio tal como estaba
            return service;
        });

        setServices(updatedServices); // Actualizamos el estado con el nuevo array
        setEditingId(null); // Dejamos de editar
    };
    // NUEVO: Se llama al hacer clic en "Generar PDF"
    const handleGeneratePDF = () => {
        // 1. Crear una nueva instancia de jsPDF
        const doc = new jsPDF();

        // 2. Definir el título y la fecha
        doc.setFontSize(18);
        doc.text('Comprobante de Servicios', 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);

        // 3. Preparar los datos para la tabla
        const tableColumn = ["Servicio", "Precio ($)"];
        const tableRows = [];

        services.forEach(service => {
            const serviceData = [
                service.name,
                service.price.toFixed(2) // Formateado a 2 decimales
            ];
            tableRows.push(serviceData);
        });

        // 4. Dibujar la tabla (¡AQUÍ ESTÁ EL CAMBIO!)
        // Ya no usamos doc.autoTable(), sino autoTable(doc, { ... })
        autoTable(doc, {
            head: [tableColumn], // La cabecera
            body: tableRows,     // El cuerpo de la tabla
            startY: 40           // La posición inicial
        });

        // 5. Calcular el total y añadirlo al final
        // Esto sigue funcionando igual, ya que autoTable(doc,...)
        // todavía adjunta 'lastAutoTable' al objeto 'doc'.
        const finalY = doc.lastAutoTable.finalY; 
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total: $${total.toFixed(2)}`, 14, finalY + 15);

        // 6. Guardar el PDF (esto dispara la descarga en el navegador)
        doc.save('comprobante-servicios.pdf');
    };

    // --- Cálculos (Valores Derivados) ---

    // Calculamos el total.
    // Usamos .reduce() en el array de servicios.
    // 'total' es el acumulador (empieza en 0).
    // 'service' es cada item del array.
    // Por cada servicio, sumamos su 'price' al 'total'.
    const total = services.reduce((accumulator, service) => {
        return accumulator + service.price;
    }, 0); // El 0 es el valor inicial del acumulador.

    // --- Estilos ---
    const styles = {
        calculatorContainer: {
            fontFamily: 'Arial, sans-serif',
            width: '500px', // Un poco más ancho para los botones de edición
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
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
            paddingBottom: '5px'
        },
        serviceList: {
            listStyleType: 'none',
            padding: 0,
        },
        serviceItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0',
            gap: '5px', // Pequeño espacio entre elementos
        },
        // NUEVO: Estilos para inputs de edición
        editInput: {
            flex: '1',
            padding: '6px',
            border: '1px solid #007bff',
            borderRadius: '4px',
        },
        editInputPrice: {
            width: '80px', // Ancho fijo para el precio
            padding: '6px',
            border: '1px solid #007bff',
            borderRadius: '4px',
        },
        // NUEVO: Estilos para botones
        editButton: {
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
            marginLeft: '10px',
        },
        deleteButton: {
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '5px 8px',
            cursor: 'pointer',
            marginLeft: '5px', // Espacio entre botones
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
        },
        // NUEVO: Estilos para el botón de PDF
        pdfButton: {
            width: '100%',
            padding: '10px',
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
            padding: '10px',
            backgroundColor: '#ccc',
            color: '#666',
            border: 'none',
            borderRadius: '4px',
            cursor: 'not-allowed',
            fontSize: '16px',
            marginTop: '10px',
        }
    }

    // --- Renderizado ---
    return (
        <div style={styles.calculatorContainer}>
            <h2>Calculadora de Servicios</h2>

            <form onSubmit={handleAddService} style={styles.form}>
                <div style={styles.inputGroup}>
                    <input
                        type="text"
                        placeholder="Nombre del Servicio"
                        value={serviceName}
                        onChange={(e) => setServiceName(e.target.value)}
                        style={styles.input}
                    />
                    <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Precio ($)"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <button type="submit" style={styles.button}>
                    Agregar Servicio
                </button>
            </form>

            <h3 style={styles.listTitle}>Servicios Agregados:</h3>
            <ul style={styles.serviceList}>
                {services.map((service) => (
                    <li key={service.id} style={styles.serviceItem}>
                        {/* NUEVO: Lógica condicional */}
                        {editingId === service.id ? (
                            // --- Modo Edición ---
                            <>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={styles.editInput}
                                />
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    style={styles.editInputPrice}
                                />
                                <button onClick={() => handleSaveEdit(service.id)} style={styles.saveButton}>Guardar</button>
                                <button onClick={handleCancelEdit} style={styles.cancelButton}>Cancelar</button>
                            </>
                        ) : (
                            // --- Modo Visualización ---
                            <>
                                <span>
                                    {service.name}: <strong>${service.price.toFixed(2)}</strong>
                                </span>
                                <div>
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

            {/* NUEVO: Botón para generar el PDF */}
            {/* Lo desactivamos si no hay servicios para evitar un PDF vacío */}
            <button
                onClick={handleGeneratePDF}
                style={services.length > 0 ? styles.pdfButton : styles.pdfButtonDisabled}
                disabled={services.length === 0}
            >
                Generar Comprobante PDF
            </button>
        </div>
    );

};

export default ServiceCalculator;
