// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

function Home() {
    const [stats, setStats] = useState({
        totalEvents: 0,
        totalRevenue: 0,
        pendingBalance: 0,
        nextEvents: []
    });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 👇 CORRECCIÓN: Si no hay usuario, cortamos pero apagamos el loading
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Traemos TODOS los eventos del usuario
            const { data: events, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('start_time', { ascending: true });

            if (error) {
                console.error('Error cargando dashboard:', error);
                // No retornamos aquí para permitir que setLoading se ejecute al final
            } else {
                // --- CÁLCULOS MATEMÁTICOS ---
                let totalRev = 0;
                let pending = 0;
                const eventsByMonth = {};

                // Filtramos eventos futuros para la lista "Próximos"
                const now = new Date();
                const nextEventsList = events
                    .filter(e => new Date(e.start_time) >= now)
                    .slice(0, 3); // Solo los próximos 3

                events.forEach(event => {
                    // Sumar Totales (extraídos del JSON client_info)
                    const info = event.client_info || {};
                    const total = parseFloat(info.total || 0);
                    const advance = parseFloat(info.advance || 0);

                    // Solo sumamos dinero de eventos confirmados/seña (no presupuestos perdidos)
                    if (event.status === 'señado' || event.status === 'confirmado') {
                        totalRev += total;
                        pending += (total - advance);
                    }

                    // Agrupar para el Gráfico (Mes y Año)
                    const date = new Date(event.start_time);
                    const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

                    if (!eventsByMonth[monthKey]) {
                        eventsByMonth[monthKey] = { name: monthKey, cantidad: 0 };
                    }
                    eventsByMonth[monthKey].cantidad += 1;
                });

                // Convertir objeto de meses a array para el gráfico
                const chartArray = Object.values(eventsByMonth);

                setStats({
                    totalEvents: events.length,
                    totalRevenue: totalRev,
                    pendingBalance: pending,
                    nextEvents: nextEventsList
                });
                setChartData(chartArray);
            }
        } catch (error) {
            console.error("Error inesperado:", error);
        } finally {
            // 👇 ESTO ES CLAVE: El loading se apaga SIEMPRE, haya error o no
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando estadísticas...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Panel de Control 📊
                </h1>
                <Link to="/calculadoradeservicios" className="text-blue-600 hover:underline">
                    + Nuevo Presupuesto
                </Link>
            </div>

            {/* --- TARJETAS DE RESUMEN --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Eventos Totales</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{stats.totalEvents}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Ingresos Estimados</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                        ${stats.totalRevenue.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-400">Total de eventos cerrados</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase">Saldo Pendiente</h3>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                        ${stats.pendingBalance.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-400">Dinero por cobrar</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* --- GRÁFICO --- */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Eventos por Mes</h3>
                    <div className="h-64">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" stroke="#8884d8" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                    />
                                    <Bar dataKey="cantidad" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Eventos" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Aún no hay datos para graficar
                            </div>
                        )}
                    </div>
                </div>

                {/* --- PRÓXIMOS EVENTOS --- */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Próximos Eventos 📅</h3>
                    {stats.nextEvents.length === 0 ? (
                        <p className="text-gray-500">No hay eventos próximos agendados.</p>
                    ) : (
                        <ul className="space-y-4">
                            {stats.nextEvents.map(event => (
                                <li key={event.id} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{event.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(event.start_time).toLocaleDateString()} - {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}hs
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full 
                                        ${event.status === 'señado' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                        {event.status ? event.status.toUpperCase() : 'PENDIENTE'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="mt-4 text-right">
                        <Link to="/eventos" className="text-blue-500 hover:underline text-sm">Ver Agenda Completa →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;