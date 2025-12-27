import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Circle, Clock, Wrench, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
    format, parseISO, isPast, isToday, isSameDay,
    startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, addMonths, subMonths, isSameMonth, formatDistanceToNow
} from 'date-fns';

const ServiceSchedulePage = () => {
    const { user } = useUser();
    const [schedule, setSchedule] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const headers = {
                    'X-User-Role': user.role,
                    'X-User-Id': user.id,
                    'X-User-Team-Id': user.team_id || ''
                };
                const res = await fetch('http://localhost:5000/api/requests', { headers }); // Fetch ALL types
                const data = await res.json();

                if (Array.isArray(data)) {
                    const sorted = data.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date));
                    setSchedule(sorted);
                }
            } catch (err) {
                console.error('Error fetching schedule:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [user]);

    // Calendar Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    // Helper: Get tasks for a specific date
    const getTasksForDate = (date) => {
        return schedule.filter(task => isSameDay(parseISO(task.scheduled_date), date));
    };

    // Filter Logic: If date selected, show only that day. Else show full month list.
    const [filterStatus, setFilterStatus] = useState(null); // 'overdue', 'today', 'future', 'done'

    // Filter Logic:
    // 1. If Filter Active -> Show specific category (Global scope)
    // 2. Else If Date Selected -> Show that day
    // 3. Else -> Show Current Month
    const filteredTasks = (() => {
        if (filterStatus === 'overdue') {
            return schedule.filter(t => isPast(parseISO(t.scheduled_date)) && !isToday(parseISO(t.scheduled_date)) && t.status !== 'repaired');
        }
        if (filterStatus === 'today') {
            return schedule.filter(t => isToday(parseISO(t.scheduled_date)));
        }
        if (filterStatus === 'future') {
            return schedule.filter(t => !isPast(parseISO(t.scheduled_date)) && !isToday(parseISO(t.scheduled_date)));
        }
        if (filterStatus === 'done') {
            return schedule.filter(t => t.status === 'repaired');
        }

        if (selectedDate) return getTasksForDate(selectedDate);
        return schedule.filter(task => isSameMonth(parseISO(task.scheduled_date), currentMonth));
    })();

    // Grouping for List View
    const groupedSchedule = filteredTasks.reduce((acc, task) => {
        const month = format(parseISO(task.scheduled_date), 'MMMM yyyy');
        if (!acc[month]) acc[month] = [];
        acc[month].push(task);
        return acc;
    }, {});

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-screen bg-brand-bg/50 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
            <div className="text-brand-muted font-black uppercase tracking-widest text-sm animate-pulse">Loading Schedule...</div>
        </div>
    );

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-8 max-w-7xl mx-auto flex flex-col h-screen overflow-hidden bg-gradient-to-br from-brand-bg to-white">
            {/* Header / Month Navigator */}
            <header className="mb-6 flex justify-between items-center bg-white/80 backdrop-blur-md p-6 border border-white/20 rounded-2xl shadow-xl ring-1 ring-black/5">
                <div>
                    <h1 className="text-3xl font-black text-brand-text uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-brand-text to-brand-primary">
                        {user.role === 'TECHNICIAN' ? 'My Schedule' : user.role === 'TEAM_LEAD' ? `${user.team_name || 'Squad'} Schedule` : 'Master Schedule'}
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                        <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <CalendarIcon size={12} />
                            Maintenance Calendar
                        </p>
                        {/* Interactive Legend Filters */}
                        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                            <button onClick={() => setFilterStatus(filterStatus === 'overdue' ? null : 'overdue')} className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${filterStatus === 'overdue' ? 'bg-red-100 text-red-600 ring-1 ring-red-200' : 'text-gray-400 hover:bg-white hover:shadow-sm'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Overdue
                            </button>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <button onClick={() => setFilterStatus(filterStatus === 'today' ? null : 'today')} className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${filterStatus === 'today' ? 'bg-blue-100 text-blue-600 ring-1 ring-blue-200' : 'text-gray-400 hover:bg-white hover:shadow-sm'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>Today
                            </button>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <button onClick={() => setFilterStatus(filterStatus === 'future' ? null : 'future')} className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${filterStatus === 'future' ? 'bg-emerald-100 text-emerald-600 ring-1 ring-emerald-200' : 'text-gray-400 hover:bg-white hover:shadow-sm'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Future
                            </button>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <button onClick={() => setFilterStatus(filterStatus === 'done' ? null : 'done')} className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${filterStatus === 'done' ? 'bg-purple-100 text-purple-600 ring-1 ring-purple-200' : 'text-gray-400 hover:bg-white hover:shadow-sm'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>Done
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-8 bg-gray-50/50 p-1 rounded-full border border-gray-200">
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-brand-muted hover:text-brand-text"><ChevronLeft size={20} /></button>
                    <span className="text-lg font-black uppercase tracking-widest w-48 text-center tabular-nums text-brand-text">{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-brand-muted hover:text-brand-text"><ChevronRight size={20} /></button>
                </div>
                <button
                    onClick={() => { setSelectedDate(null); setCurrentMonth(new Date()); }}
                    className="px-6 py-2.5 bg-brand-primary text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                >
                    Here & Now
                </button>
            </header>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* LEFT: Calendar Grid */}
                <div className="w-7/12 flex flex-col bg-white/60 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-black/5">
                    {/* Weekday Header */}
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-white/50">
                        {weekDays.map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black text-brand-muted uppercase tracking-widest opacity-60">
                                {day}
                            </div>
                        ))}
                    </div>
                    {/* Days Grid */}
                    <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-white/30">
                        {calendarDays.map((day, idx) => {
                            const isCurrentMonth = isSameMonth(day, monthStart);
                            const dayTasks = getTasksForDate(day);
                            const isSelected = selectedDate && isSameDay(day, selectedDate);
                            const isTodayDate = isToday(day);

                            return (
                                <button
                                    key={day.toString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`
                                        relative border-r border-b border-gray-100 flex flex-col items-center justify-start py-3 group transition-all duration-200
                                        ${!isCurrentMonth ? 'bg-gray-50/30 text-gray-300' : 'hover:bg-white hover:shadow-inner'}
                                        ${isSelected ? 'bg-brand-primary/5 shadow-inner' : ''}
                                    `}
                                >
                                    <span className={`
                                        text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full mb-2 transition-all duration-300
                                        ${isTodayDate ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30 scale-110' : ''}
                                        ${isSelected && !isTodayDate ? 'bg-brand-text text-white scale-110' : ''}
                                        ${!isTodayDate && !isSelected ? 'group-hover:bg-gray-100' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    {/* Task Indicators */}
                                    <div className="flex gap-1 mt-1 flex-wrap justify-center px-1 max-w-[80%]">
                                        {dayTasks.slice(0, 4).map((t, i) => {
                                            const tDate = parseISO(t.scheduled_date);
                                            // Color Logic
                                            let dotColor = 'bg-emerald-400'; // Default Future
                                            if (t.status === 'repaired') dotColor = 'bg-purple-400'; // Done
                                            else if (isToday(tDate)) dotColor = 'bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.5)]'; // Today
                                            else if (isPast(tDate) && t.status !== 'repaired') dotColor = 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]'; // Overdue

                                            return (
                                                <div
                                                    key={i}
                                                    className={`w-1.5 h-1.5 rounded-full ring-1 ring-white ${dotColor}`}
                                                    title={`${t.subject} (${t.status})`}
                                                />
                                            );
                                        })}
                                        {dayTasks.length > 4 && <span className="text-[6px] text-gray-400 leading-none">+</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: Task List */}
                <div className="w-5/12 flex flex-col overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl ring-1 ring-black/5">
                    <div className="p-6 border-b border-gray-100 bg-white/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-brand-text flex items-center gap-2">
                                {selectedDate ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                                        Tasks for {format(selectedDate, 'MMM dd, yyyy')}
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                        All Tasks • {format(currentMonth, 'MMMM')}
                                    </>
                                )}
                            </h2>
                        </div>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-[10px] font-bold text-brand-primary uppercase hover:underline transition-all">
                                View All
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {Object.keys(groupedSchedule).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-brand-muted/40 animate-in fade-in zoom-in duration-500">
                                <CheckCircle2 size={48} className="mb-4" />
                                <p className="text-xs font-bold uppercase tracking-widest">No Maintenance Scheduled</p>
                                <p className="text-[10px] mt-1">Select another day or check back later.</p>
                            </div>
                        ) : (
                            Object.entries(groupedSchedule).map(([group, tasks]) => (
                                <div key={group} className="animate-in slide-in-from-right duration-500">
                                    {!selectedDate && (
                                        <div className="flex items-center gap-4 mb-4">
                                            <h3 className="text-xs font-black text-brand-muted uppercase tracking-widest">{group}</h3>
                                            <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                                        </div>
                                    )}
                                    <div className="space-y-4">
                                        {tasks.map(task => {
                                            const date = parseISO(task.scheduled_date);
                                            const overdue = isPast(date) && !isToday(date) && task.status !== 'repaired';
                                            const isTodayTask = isToday(date);

                                            return (
                                                <div
                                                    key={task.id}
                                                    className={`
                                                        group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden
                                                        ${overdue ? 'ring-1 ring-red-100' : isTodayTask ? 'ring-1 ring-blue-100' : ''}
                                                    `}
                                                >
                                                    {/* Status Strip */}
                                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${overdue ? 'bg-red-500' : isTodayTask ? 'bg-blue-500' : 'bg-emerald-400'}`} />

                                                    <div className="flex justify-between items-start mb-3 pl-2">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[8px] font-black bg-gray-50 px-2 py-1 rounded-md uppercase tracking-widest text-gray-500 border border-gray-100">
                                                                    {task.team_name || 'General'}
                                                                </span>
                                                                {overdue && <span className="flex items-center gap-1 text-[8px] font-black bg-red-50 text-red-600 px-2 py-1 rounded-md uppercase tracking-widest border border-red-100"><AlertTriangle size={8} /> Overdue</span>}
                                                            </div>
                                                            <h4 className="text-sm font-black text-brand-text uppercase leading-tight truncate" title={task.subject}>{task.subject}</h4>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end">
                                                            <span className={`block text-xl font-black leading-none ${overdue ? 'text-red-500' : isTodayTask ? 'text-blue-500' : 'text-brand-text'}`}>
                                                                {format(date, 'dd')}
                                                            </span>
                                                            <span className="text-[8px] font-bold uppercase text-brand-muted">{format(date, 'MMM')}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex justify-between items-center pl-2 pt-3 border-t border-gray-50">
                                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                                            <Circle size={8} fill="currentColor" stroke="none" className={task.status === 'repaired' ? 'text-emerald-500' : task.status === 'in_progress' ? 'text-amber-500' : 'text-gray-300'} />
                                                            {task.status.replace('_', ' ')}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-brand-primary uppercase tracking-wide truncate max-w-[140px] flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                                            <Clock size={10} />
                                                            {formatDistanceToNow(date, { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceSchedulePage;
