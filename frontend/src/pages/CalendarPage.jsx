import React, { useState, useEffect } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import MaintenanceRequestModal from '../components/MaintenanceRequestModal';
import { useUser } from '../context/UserContext';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    const fetchEvents = () => {
        const headers = {
            'X-User-Role': user.role,
            'X-User-Id': user.id,
            'X-User-Team-Id': user.team_id || ''
        };
        fetch('http://localhost:5000/api/requests?type=preventive', { headers })
            .then(res => res.json())
            .then(data => {
                // Matrix: Team Admin and Technician see TEAM ONLY
                let filtered = data;
                if (user.role !== 'SUPER_ADMIN') {
                    filtered = data.filter(e => Number(e.team_id) === Number(user.team_id));
                }
                setEvents(filtered);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching calendar events:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const renderHeader = () => {
        return (
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-black text-brand-text uppercase tracking-tighter">
                        {format(currentMonth, 'MMMM yyyy')}
                    </h1>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-1">Industrial Asset Service Schedule</p>
                </div>
                <div className="flex border-2 border-brand-border rounded-sm overflow-hidden bg-white">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="w-12 h-12 flex items-center justify-center text-brand-muted hover:text-brand-primary border-r-2 border-brand-border transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="w-12 h-12 flex items-center justify-center text-brand-muted hover:text-brand-primary transition-all"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 border-2 border-brand-border bg-white divide-x-2 divide-brand-border">
                {days.map((day, i) => (
                    <div key={i} className="py-4 text-center text-[10px] font-black text-brand-muted uppercase tracking-widest bg-gray-50/50">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const allDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        const rows = [];
        let days = [];

        allDays.forEach((d, i) => {
            const formattedDate = format(d, 'd');
            const isCurrentMonth = isSameMonth(d, monthStart);
            const isToday = isSameDay(d, new Date());

            const dayEvents = events.filter(e => {
                if (!e.scheduled_date) return false;
                const eventDate = parseISO(e.scheduled_date);
                return isSameDay(eventDate, d);
            });

            days.push(
                <div
                    key={d.toString()}
                    className={`min-h-[140px] p-2 border-r-2 border-b-2 transition-all cursor-pointer group hover:bg-gray-50 relative ${!isCurrentMonth ? 'bg-gray-50/20 text-brand-muted opacity-40' : 'bg-white'
                        } ${dayEvents.some(e => e.isOverdue) ? 'border-red-500' : 'border-brand-border'}`}
                    onClick={() => {
                        if (user.role === 'TECHNICIAN') return; // Matrix: NO for Technician
                        setSelectedDate(d);
                        setIsModalOpen(true);
                    }}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-sm font-black transition-all ${isToday ? 'bg-brand-primary text-white w-7 h-7 flex items-center justify-center rounded-sm' : ''}`}>
                            {formattedDate}
                        </span>
                        {dayEvents.length > 0 && <AlertCircle size={10} className="text-brand-primary" />}
                    </div>

                    <div className="space-y-1">
                        {dayEvents.map((event, idx) => (
                            <div key={idx} className={`p-1.5 rounded-sm flex flex-col gap-0.5 border ${event.isOverdue ? 'bg-red-600 border-red-200 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-brand-primary text-white border-white/20'}`}>
                                <span className="text-[8px] font-black uppercase leading-tight truncate">
                                    {event.isOverdue && '⚠️ '}
                                    {event.subject}
                                </span>
                                <span className="text-[7px] font-bold opacity-70 uppercase leading-none truncate">{event.equipment_name}</span>
                            </div>
                        ))}
                    </div>

                    {user.role !== 'TECHNICIAN' && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                            <div className="bg-white/80 backdrop-blur px-3 py-1 border border-brand-border rounded-sm text-[8px] font-black text-brand-primary uppercase tracking-widest">
                                + Book Service
                            </div>
                        </div>
                    )}
                </div>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(
                    <div key={i} className="grid grid-cols-7 border-l-2 border-brand-border">
                        {days}
                    </div>
                );
                days = [];
            }
        });

        return <div className="border-t-2 border-brand-border">{rows}</div>;
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-2 pb-10">
            {renderHeader()}

            <div className="relative">
                {renderDays()}
                {renderCells()}
            </div>

            <MaintenanceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedDate={selectedDate}
                onSuccess={fetchEvents}
                initialType="preventive"
            />
        </div>
    );
};

export default CalendarPage;
