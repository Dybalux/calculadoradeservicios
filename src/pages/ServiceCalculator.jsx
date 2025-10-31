import React, { useState } from 'react';

function ServiceCalculator() {

    // --- Estados ---  
    // 1. `services`: Un array para guardar la lista de servicios. 
    //    Empieza como un array vacío.
    const [services, setServices] = useState([]);

    // 2. `serviceName`: Guarda lo que escribes en el campo "Nombre del Servicio".
    const [serviceName, setServiceName] = useState('');

    // 3. `servicePrice`: Guarda lo que escribes en el campo "Precio".
    //    Lo guardamos como string, luego lo convertiremos a número.
    const [servicePrice, setServicePrice] = useState('');

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

    // --- Cálculos (Valores Derivados) ---

    // Calculamos el total.
    // Usamos .reduce() en el array de servicios.
    // 'total' es el acumulador (empieza en 0).
    // 'service' es cada item del array.
    // Por cada servicio, sumamos su 'price' al 'total'.
    const total = services.reduce((accumulator, service) => {
        return accumulator + service.price;
    }, 0); // El 0 es el valor inicial del acumulador.

    // --- Renderizado ---
    return (
        <div style={styles.calculatorContainer}>
            <h2>Calculadora de Servicios</h2>

            {/* Formulario para agregar nuevos servicios */}
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
                        type="number" // El tipo 'number' ayuda en móviles
                        min="0.01"
                        step="0.01" // Permite decimales
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

            {/* Lista de servicios agregados */}
            <h3 style={styles.listTitle}>Servicios Agregados:</h3>
            <ul style={styles.serviceList}>
                {/* Usamos .map() para "dibujar" un <li> por cada servicio en el estado */}
                {services.map((service) => (
                    <li key={service.id} style={styles.serviceItem}>
                        <span>
                            {service.name}: <strong>${service.price.toFixed(2)}</strong>
                        </span>
                        {/* Botón para llamar a la función de eliminar */}
                        <button
                            onClick={() => handleDeleteService(service.id)}
                            style={styles.deleteButton}
                        >
                            Eliminar
                        </button>
                    </li>
                ))}
            </ul>

            {/* Mostramos el total */}
            {/* .toFixed(2) es para mostrar siempre 2 decimales (ej: 150.00) */}
            <h2 style={styles.total}>
                Total: ${total.toFixed(2)}
            </h2>
        </div>
    );
}

// --- Estilos (Opcional) ---
// Agrego unos estilos básicos aquí mismo para que se vea ordenado
// sin necesidad de un archivo CSS externo.
const styles = {
    calculatorContainer: {
        fontFamily: 'Arial, sans-serif',
        width: '400px',
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
        flex: '1', // Hace que ambos inputs compartan el espacio
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
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '5px 8px',
        cursor: 'pointer',
    },
    total: {
        textAlign: 'right',
        marginTop: '20px',
        color: '#28a745',
    }
}

export default ServiceCalculator;
