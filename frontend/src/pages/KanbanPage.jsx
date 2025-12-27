import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import { useSearchParams } from 'react-router-dom';
import { Filter, Users, Layout, XCircle, BarChart3, Plus } from 'lucide-react';
import MaintenanceRequestModal from '../components/MaintenanceRequestModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import { useUser } from '../context/UserContext';
import { format, parseISO } from 'date-fns';
import KanbanCard from '../components/KanbanCard';

const KanbanPage = () => {
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState({ teams: [], global: {} });
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('status'); // 'status' or 'equipment'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignContext, setAssignContext] = useState({ requestId: null, teamId: null });
    const [error, setError] = useState(null);
    const [activeId, setActiveId] = useState(null); // Track dragged item
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useUser();
    const equipmentId = searchParams.get('equipmentId');

    const statusList = ["new", "in_progress", "repaired", "scrap"];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const fetchData = async () => {
        try {
            const headers = {
                'X-User-Role': user.role,
                'X-User-Id': user.id,
                'X-User-Team-Id': user.team_id || ''
            };

            let url = 'http://localhost:5000/api/requests';
            if (equipmentId) {
                url += `?equipment_id=${equipmentId}`;
            }

            const summaryParams = equipmentId ? `?equipment_id=${equipmentId}` : '';
            const [reqRes, summaryRes] = await Promise.all([
                fetch(url, { headers }),
                fetch(`http://localhost:5000/api/reports/summary${summaryParams}`, { headers })
            ]);

            const requests = await reqRes.json();
            const reportData = await summaryRes.json();

            // Safety Check: Ensure requests is always an array
            const safeRequests = Array.isArray(requests) ? requests : [];
            const safeSummary = reportData && !reportData.error ? reportData : { teams: [], global: {} };

            // Role-Based Filtering
            let filteredRequests = safeRequests;
            if (user.role === 'TEAM_ADMIN') {
                filteredRequests = safeRequests.filter(r => Number(r.team_id) === Number(user.team_id));
            } else if (user.role === 'TECHNICIAN') {
                filteredRequests = safeRequests.filter(r =>
                    Number(r.technician_id) === Number(user.id) || (Number(r.team_id) === Number(user.team_id) && !r.technician_id)
                );
            }

            setTasks(filteredRequests);
            setSummary(safeSummary);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [equipmentId]);

    const handleAssign = (requestId, teamId) => {
        // Instead of prompt, we now open the dedicated modal
        setAssignContext({ requestId, teamId });
        setIsAssignModalOpen(true);
    };

    const submitAssignment = async (techId) => {
        const { requestId } = assignContext;
        try {
            const res = await fetch(`http://localhost:5000/api/requests/${requestId}/assign`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': user.role,
                    'X-User-Id': user.id,
                    'X-User-Team-Id': user.team_id || ''
                },
                body: JSON.stringify({ technician_id: parseInt(techId) }),
            });

            if (!res.ok) throw new Error('Failed to assign technician');

            setIsAssignModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Assignment error:', error);
            alert('Error assigning technician');
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (groupBy !== 'status') return; // Drag and drop only for status view for now

        if (over && active.id !== over.id) {
            const activeTask = tasks.find(t => t.id.toString() === active.id.toString());
            const overStatus = over.id;

            if (activeTask && statusList.includes(overStatus)) {
                let durationHours = null;

                // PDF Requirement: Record Hours Spent (Duration) on completion
                if (overStatus === 'repaired' || overStatus === 'scrap') {
                    const input = prompt("Enter Hours Spent (Duration):", "1");
                    if (input === null) return; // User cancelled
                    durationHours = parseFloat(input) || 0;
                }

                const originalTasks = [...tasks];
                setTasks((prev) =>
                    prev.map((task) =>
                        task.id === active.id ? { ...task, status: overStatus, duration_hours: durationHours } : task
                    )
                );

                try {
                    // --- ROLE-BASED TRANSITION GUARDS (ADHERING TO MATRIX) ---

                    // Super Admin: Global Override (No restrictions)
                    if (user.role === 'SUPER_ADMIN') {
                        // Allow all
                    }
                    // Team Admin: Team-Specific Management
                    else if (user.role === 'TEAM_ADMIN') {
                        // Matrix: "Manage requests of their own team"
                        // Guard: Ensure task belongs to their team (already filtered in view, but safety first)
                        if (activeTask.team_id !== user.team_id) {
                            alert('Unauthorized: You can only moderate your own team workflow.');
                            setTasks(originalTasks);
                            return;
                        }
                    }
                    // Technician: Execution-Level Only
                    else if (user.role === 'TECHNICIAN') {
                        // Matrix: "Execute tasks only"

                        // 1. Strict Flow: New -> In Progress -> Repaired/Scrap
                        if (activeTask.status === 'new' && overStatus !== 'in_progress') {
                            alert('Strict Workflow: You must move the task to "In Progress" before completing it.');
                            setTasks(originalTasks);
                            return;
                        }

                        // 2. Cannot move tasks back to 'new' (Execution flow)
                        if (overStatus === 'new') {
                            alert('Technicians cannot reset production issues. This requires Admin moderation.');
                            setTasks(originalTasks);
                            return;
                        }
                        // 3. Cannot move tasks assigned to someone else
                        if (activeTask.technician_id && Number(activeTask.technician_id) !== Number(user.id)) {
                            alert('Unauthorized: You can only update your own assigned tasks.');
                            setTasks(originalTasks);
                            return;
                        }
                        // 4. Must be assigned to move tasks
                        if (!activeTask.technician_id) {
                            alert('This task is unassigned. Please wait for your Team Lead to delegate it.');
                            setTasks(originalTasks);
                            return;
                        }
                    }

                    const res = await fetch(`http://localhost:5000/api/requests/${activeTask.id}/status`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User-Role': user.role,
                            'X-User-Id': user.id,
                            'X-User-Team-Id': user.team_id || ''
                        },
                        body: JSON.stringify({
                            status: overStatus,
                            duration_hours: durationHours
                        }),
                    });

                    if (!res.ok) throw new Error('Action Unauthorized or Server Error');
                    fetchData(); // Refresh summary stats
                } catch (error) {
                    alert(`Update failed: ${error.message}`);
                    setTasks(originalTasks);
                }
            }
        }
    };

    const clearFilter = () => {
        setSearchParams({});
    };

    // Helper to find active task data for overlay
    const activeTask = tasks.find(t => t.id === activeId);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    // Define unique teams for grouping
    const teamsList = Array.from(new Set(tasks.map(t => t.team_name || 'Unassigned')));

    return (
        <div className="space-y-6 pb-10">
            {/* Header & Smart Tools */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-text uppercase tracking-tighter">AutoMotion Assembly Oversight</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">
                            {equipmentId ? `Line Asset #${equipmentId} Diagnosis` : 'Production Line Maintenance Monitor'}
                        </p>
                        {equipmentId && (
                            <button
                                onClick={clearFilter}
                                className="flex items-center gap-1.5 px-2 py-0.5 border border-brand-primary text-brand-primary rounded-full text-[8px] font-black uppercase hover:bg-brand-primary hover:text-white transition-all"
                            >
                                <XCircle size={10} />
                                Clear Filter
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 self-stretch md:self-auto">
                    {(user.role === 'SUPER_ADMIN' || user.role === 'TEAM_ADMIN') && (
                        <div className="flex items-center gap-2 bg-white border-2 border-brand-border rounded-sm p-1">
                            <button
                                onClick={() => setGroupBy('status')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${groupBy === 'status' ? 'bg-brand-text text-white' : 'text-brand-muted hover:bg-gray-50'}`}
                            >
                                By Status
                            </button>
                            <button
                                onClick={() => setGroupBy('equipment')}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all ${groupBy === 'equipment' ? 'bg-brand-text text-white' : 'text-brand-muted hover:bg-gray-50'}`}
                            >
                                By Equipment
                            </button>
                            <div className="w-px h-6 bg-brand-border mx-2" />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-brand-primary text-white px-6 py-2 rounded-sm border-2 border-brand-primary hover:border-brand-text transition-all font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
                            >
                                Log Issue
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-500 p-4 flex items-center gap-3 animate-bounce">
                    <XCircle size={18} className="text-red-500" />
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* KPI Bar */}
            {/* KPI Summary Bar - Matrix: YES for Admin/Team Admin, NO for Technician */}
            {(user.role === 'SUPER_ADMIN' || user.role === 'TEAM_ADMIN') && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-brand-primary text-white p-6 rounded-sm border-2 border-brand-primary flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Active Line Faults</p>
                            <h2 className="text-4xl font-black tracking-tighter">{summary.global.total_open || 0}</h2>
                        </div>
                        <Layout size={40} className="opacity-20 translate-x-4" />
                    </div>

                    {summary.teams.map((t) => (
                        <div key={t.team} className="bg-white p-6 rounded-sm border-2 border-brand-border flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-start">
                                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">{t.team} SQUAD</p>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black ${t.open > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                    {t.open > 0 ? 'ACTIVE ISSUES' : 'CLEAR'}
                                </span>
                            </div>
                            <div className="flex items-end justify-between mt-4">
                                <h3 className="text-2xl font-black text-brand-text leading-none">{t.open}</h3>
                                <div className="text-right">
                                    <p className="text-[8px] font-bold text-brand-muted uppercase leading-none">Completed</p>
                                    <p className="text-xs font-black text-brand-text">{t.completed}/{t.total}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Main Board */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
                    {groupBy === 'status' ? (
                        statusList.map((status) => (
                            <KanbanColumn
                                key={status}
                                id={status}
                                title={status === 'in_progress' ? 'Repairs Active' : status.replace('_', ' ')}
                                requests={tasks.filter((t) => t.status === status)}
                                onAssign={handleAssign}
                            />
                        ))
                    ) : (
                        // Grouping by Equipment
                        [...new Set(tasks.map(t => t.equipment_name || 'Unassigned'))].map(equipName => (
                            <KanbanColumn
                                key={equipName}
                                id={equipName}
                                title={equipName}
                                requests={tasks.filter(t => (t.equipment_name || 'Unassigned') === equipName)}
                                onAssign={handleAssign}
                                isDroppable={false}
                            />
                        ))
                    )}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="transform rotate-3 scale-105 opacity-90 cursor-grabbing">
                            <KanbanCard
                                id={activeTask.id}
                                subject={activeTask.subject}
                                equipment={activeTask.equipment_name}
                                technician={activeTask.technician_name}
                                teamId={activeTask.team_id}
                                teamName={activeTask.team_name}
                                date={activeTask.scheduled_date ? format(parseISO(activeTask.scheduled_date), 'MMM d') : '-'}
                                isOverdue={activeTask.isOverdue}
                                status={activeTask.status}
                                onAssign={null} // Disable actions while dragging
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <MaintenanceRequestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />

            <AssignTechnicianModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssign={submitAssignment}
                teamId={assignContext.teamId}
            />
        </div>
    );
};

export default KanbanPage;
