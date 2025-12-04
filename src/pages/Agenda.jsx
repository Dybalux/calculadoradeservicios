import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { supabase } from '../supabase/client';
import toast from 'react-hot-toast';
import AddEventModal from '../components/AddEventModal';

// --- CONFIGURACIÓN DEL CALENDARIO ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DnDCalendar = withDragAndDrop(Calendar);

function Agenda() {
    // --- ESTADOS ---
    const [date, setDate] = useState(new Date()); // Control de fecha
    const [view, setView] = useState(Views.MONTH); // Control de vista
    const [events, setEvents] = useState([]); // Lista de eventos
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null); // Para nuevo evento
    const [selectedEvent, setSelectedEvent] = useState(null); // Para editar evento
    const [isAdmin, setIsAdmin] = useState(false); // Rol del usuario

    // --- EFECTOS ---
    useEffect(() => {
        fetchEvents();
        checkUserRole();
    }, []);

    // --- FUNCIONES DE SEGURIDAD Y DATOS ---

    // 1. Verificar si es Admin
    const checkUserRole = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (data && data.role === 'admin') {
                setIsAdmin(true);
            }
        }
    };

    // 2. Cargar eventos desde Supabase
    const fetchEvents = async () => {
        const { data, error } = await supabase.from('events').select('*');

        if (error) {
            toast.error('Error al cargar eventos');
        } else {
            // Formatear fechas de String a Date objects para el calendario
            const formattedEvents = data.map(event => ({
                ...event,
                title: event.title,
                start: new Date(event.start_time),
                end: new Date(event.end_time),
            }));
            setEvents(formattedEvents);
        }
    };

    // --- FUNCIONES DE ACCIÓN (Crear, Editar, Borrar, Mover) ---

    // 3. Guardar (Crear o Actualizar)
    const handleSaveEvent = async (eventData) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return toast.error('Debes iniciar sesión');

        if (eventData.id) {
            // EDITAR (UPDATE)
            if (!isAdmin) return toast.error('Solo administradores pueden editar.');

            // 1. Recuperamos el evento original para no perder datos
            const originalEvent = events.find(e => e.id === eventData.id);

            // 2. Mezclamos la info existente con el nuevo nombre
            const updatedClientInfo = {
                ...(originalEvent?.client_info || {}), // Mantiene services, total, etc.
                name: eventData.client_name   // Actualiza solo el nombre si cambió
            };
            const { error } = await supabase
                .from('events')
                .update({
                    title: eventData.title,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time,
                    client_info: updatedClientInfo
                })
                .eq('id', eventData.id);

            if (error) toast.error('Error al actualizar: ' + error.message);
            else {
                toast.success('Evento actualizado');
                fetchEvents();
            }
        } else {
            // CREAR (INSERT)
            const { error } = await supabase
                .from('events')
                .insert([{
                    title: eventData.title,
                    start_time: eventData.start_time,
                    end_time: eventData.end_time,
                    client_info: { name: eventData.client_name },
                    user_id: user.id,
                    status: 'confirmado'
                }]);

            if (error) toast.error('Error al guardar: ' + error.message);
            else {
                toast.success('Evento creado');
                fetchEvents();
            }
        }
    };

    // 4. Borrar Evento
    const handleDeleteEvent = async (id) => {
        if (!isAdmin) return toast.error('Solo administradores pueden borrar.');

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) toast.error('Error al eliminar');
        else {
            toast.success('Evento eliminado');
            fetchEvents();
        }
    };

    // 5. Mover Evento (Drag & Drop)
    const onEventDrop = async ({ event, start, end }) => {
        if (!isAdmin) return;

        // Actualización optimista (visual inmediata)
        const updatedEvents = events.map(existing =>
            existing.id === event.id ? { ...existing, start, end } : existing
        );
        setEvents(updatedEvents);

        // Guardar en BDD
        const { error } = await supabase
            .from('events')
            .update({
                start_time: start.toISOString(),
                end_time: end.toISOString()
            })
            .eq('id', event.id);

        if (error) {
            toast.error("Error al mover evento");
            fetchEvents(); // Revertir si falla
        } else {
            toast.success("Evento reagendado");
        }
    };

    // --- HANDLERS DE INTERFAZ ---

    // Clic en espacio vacío -> Abrir modal para CREAR
    const handleSelectSlot = ({ start }) => {
        if (!isAdmin) return;
        setSelectedEvent(null);
        setSelectedDate(start);
        setIsModalOpen(true);
    };

    // Clic en evento existente -> Abrir modal para EDITAR
    const handleSelectEvent = (event) => {
        if (!isAdmin) return; // Opcional: permitir ver detalles a usuarios normales
        setSelectedEvent(event);
        setSelectedDate(null);
        setIsModalOpen(true);
    };

    // --- RENDER ---
    return (
        <div className="p-4 h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold">Agenda de Eventos</h2>
                {isAdmin && (
                    <button
                        onClick={() => {
                            setSelectedEvent(null);
                            setSelectedDate(new Date());
                            setIsModalOpen(true);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + Nuevo Evento
                    </button>
                )}
            </div>

            <div className="flex-1 bg-white text-black p-4 rounded-lg shadow-lg relative">
                <DnDCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture='es'

                    // Control de Navegación
                    date={date}
                    view={view}
                    onNavigate={setDate}
                    onView={setView}

                    // Interacción
                    selectable={isAdmin}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}

                    // Drag & Drop (Solo Admin)
                    draggableAccessor={() => isAdmin}
                    resizableAccessor={() => isAdmin}
                    onEventDrop={onEventDrop}

                    messages={{
                        next: "Siguiente", previous: "Anterior", today: "Hoy",
                        month: "Mes", week: "Semana", day: "Día",
                        agenda: "Agenda", date: "Fecha", time: "Hora", event: "Evento",
                        noEventsInRange: "No hay eventos en este rango."
                    }}
                />
            </div>

            <AddEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                initialDate={selectedDate}
                eventToEdit={selectedEvent}
            />
        </div>
    );
}

export default Agenda;