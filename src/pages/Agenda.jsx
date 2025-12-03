// src/pages/Agenda.jsx
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'es': es,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// --- GENERADOR DE EVENTOS DE PRUEBA ---
// Usamos fechas relativas a "HOY" para asegurarnos de verlos siempre
const now = new Date();
const year = now.getFullYear();
const month = now.getMonth();
const day = now.getDate();

const myEventsList = [
    {
        title: 'Evento de Prueba (Hoy)',
        // Empieza hoy a las 10:00 AM
        start: new Date(year, month, day, 10, 0),
        // Termina hoy a las 12:00 PM
        end: new Date(year, month, day, 12, 0),
        status: 'confirmado'
    },
    {
        title: 'Evento Mañana (Tarde)',
        // Mañana a las 15:00
        start: new Date(year, month, day + 1, 15, 0),
        end: new Date(year, month, day + 1, 17, 0),
        status: 'reservado'
    },
    {
        title: 'Evento Ayer (Pasado)',
        // Ayer a las 09:00
        start: new Date(year, month, day - 1, 9, 0),
        end: new Date(year, month, day - 1, 11, 0),
        status: 'consultado'
    }
];

function Agenda() {
    // 1. ESTADO PARA CONTROLAR LA FECHA
    const [date, setDate] = useState(new Date());

    // 2. ESTADO PARA CONTROLAR LA VISTA (Mes, Semana, Día)
    const [view, setView] = useState(Views.MONTH);

    // 3. HANDLERS PARA QUE FUNCIONEN LOS BOTONES
    const onNavigate = (newDate) => {
        setDate(newDate);
    };

    const onView = (newView) => {
        setView(newView);
    };

    return (
        <div className="p-4 h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-center">Agenda de Eventos</h2>

            <div className="h-[600px] bg-white text-black p-4 rounded-lg shadow-lg">
                <Calendar
                    localizer={localizer}
                    events={myEventsList}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    culture='es'

                    // Pasamos el control al estado
                    date={date}
                    view={view}
                    onNavigate={onNavigate}
                    onView={onView}

                    messages={{
                        next: "Siguiente",
                        previous: "Anterior",
                        today: "Hoy",
                        month: "Mes",
                        week: "Semana",
                        day: "Día",
                        agenda: "Agenda",
                        date: "Fecha",
                        time: "Hora",
                        event: "Evento",
                        noEventsInRange: "No hay eventos en este rango."
                    }}
                />
            </div>
        </div>
    );
}

export default Agenda;