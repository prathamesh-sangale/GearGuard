import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import { useSearchParams } from 'react-router-dom';
import { Filter, Users, Layout, XCircle, BarChart3, Plus, AlertCircle, X } from 'lucide-react';
import MaintenanceRequestModal from '../components/MaintenanceRequestModal';
import AssignTechnicianModal from '../components/AssignTechnicianModal';
import { useUser } from '../context/UserContext';
import { format, parseISO } from 'date-fns';
import KanbanCard from '../components/KanbanCard';

const KanbanPage = () => {
    const [tasks, setTasks] = useState([]);
    const [triageTasks, setTriageTasks] = useState([]); // Phase T: Separated Triage State
    const [summary, setSummary] = useState({ teams: [], global: {} });
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState(new Date());
    const [groupBy, setGroupBy] = useState('status'); // 'status' or 'equipment'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [followUpData, setFollowUpData] = useState(null);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isRouteModalOpen, setIsRouteModalOpen] = useState(false); // Phase T: Routing Modal
    const [assignContext, setAssignContext] = useState({ requestId: null, teamId: null });
    const [routeContext, setRouteContext] = useState({ requestId: null });
    const [teams, setTeams] = useState([]); // Phase T: Teams for routing dropdown
    const [error, setError] = useState(null);
    const [activeId, setActiveId] = useState(null); // Track dragged item
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useUser();
    const equipmentId = searchParams.get('equipmentId');
    const technicianId = searchParams.get('technicianId');

    const statusList = ["new", "in_progress", "repaired", "scrap"];

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
    );

    const fetchData = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);

            const headers = {
                'X-User-Role': user.role,
                'X-User-Id': user.id,
                'X-User-Team-Id': user.team_id || ''
            };

            let url = 'http://localhost:5000/api/requests';
            const params = new URLSearchParams();
            if (equipmentId) params.append('equipment_id', equipmentId);
            if (technicianId) params.append('technician_id', technicianId); // Assuming backend supports this

            const reqUrl = `${url}?${params.toString()}`;
            const summaryUrl = `http://localhost:5000/api/reports/summary?${params.toString()}`;

            const [reqRes, summaryRes, teamsRes] = await Promise.all([
                fetch(reqUrl, { headers }),
                fetch(summaryUrl, { headers }),
                fetch('http://localhost:5000/api/teams', { headers })
            ]);

            const requests = await reqRes.json();
            const reportData = await summaryRes.json();
            const teamsData = await teamsRes.json();

            // Safety Check: Ensure requests is always an array
            const safeRequests = Array.isArray(requests) ? requests : [];
            const safeSummary = reportData && !reportData.error ? reportData : { teams: [], global: {} };

            // Role-Based Filtering
            let filteredRequests = safeRequests;
            if (user.role === 'TEAM_LEAD' || user.role === 'TEAM_LEAD') {
                filteredRequests = safeRequests.filter(r => String(r.team_id) === String(user.team_id));
            } else if (user.role === 'TECHNICIAN') {
                filteredRequests = safeRequests.filter(r =>
                    String(r.technician_id) === String(user.id) || (String(r.team_id) === String(user.team_id) && !r.technician_id)
                );
            }

            // Phase T: Split Triage vs Board Tasks
            const triage = [];
            const board = [];

            // Helper to identify Triage Squad (Robustness: Find by name)
            // Backend seeded it. Let's assume name or ID.
            // Note: In server.js we rely on name in queries if needed, but here we have team_name field.

            // Filter Logic
            filteredRequests.forEach(r => {
                if (r.team_name === 'Triage Squad') {
                    if (user.role === 'SUPER_ADMIN' || user.role === 'TEAM_LEAD') {
                        triage.push(r);
                    }
                    // Technicians do not see Triage tasks at all
                } else {
                    board.push(r);
                }
            });

            setTasks(board);
            setTriageTasks(triage);
            setTeams(Array.isArray(teamsData) ? teamsData : []);
            setSummary(safeSummary);
            setLastSynced(new Date());
            if (!isBackground) setLoading(false);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            fetchData(true);
        }, 15000); // 15s
        return () => clearInterval(interval);
    }, [equipmentId, user]);

    const handleAssign = (requestId, teamId) => {
        // Instead of prompt, we now open the dedicated modal
        setAssignContext({ requestId, teamId });
        setIsAssignModalOpen(true);
    };

    const handleCreateFollowUp = (data) => {
        setFollowUpData({ id: data.id, subject: data.subject, equipmentId: data.equipment_id || tasks.find(t => t.id === data.id)?.equipment_id });
        setIsModalOpen(true);
    };

    const handleRoute = (requestId) => {
        setRouteContext({ requestId });
        setIsRouteModalOpen(true);
    };

    const submitRouting = async (targetTeamId) => {
        const { requestId } = routeContext;
        try {
            const res = await fetch(`http://localhost:5000/api/requests/${requestId}/team`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': user.role,
                    'X-User-Id': user.id,
                    'X-User-Team-Id': user.team_id || ''
                },
                body: JSON.stringify({ team_id: parseInt(targetTeamId) }),
            });

            if (!res.ok) throw new Error('Failed to route request');

            setIsRouteModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Routing error:', error);
            alert('Error routing request');
        }
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
                body: JSON.stringify({ technician_id: techId }),
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
            // Optimistic UI Update
            const originalTasks = [...tasks];
            const newStatus = over.id;

            // Strict Workflow Guard: Techs can only move New -> In Progress -> Repaired/Scrap
            if (user.role === 'TECHNICIAN') {
                if (activeTask.status === 'new' && newStatus !== 'in_progress') {
                    alert('Workflow Violation: You must start the job (In Progress) before finishing it.');
                    setTasks(originalTasks);
                    return;
                }
                if (activeTask.status === 'in_progress' && newStatus === 'new') {
                    alert('Technicians cannot reset production issues. This requires Admin moderation.');
                    setTasks(originalTasks);
                    return;
                }
                if (activeTask.status === 'repaired' || activeTask.status === 'scrap') {
                    if (newStatus !== 'repaired' && newStatus !== 'scrap') {
                        alert('Completed tasks cannot be moved back to an active state.');
                        setTasks(originalTasks);
                        return;
                    }
                }
                // Cannot move tasks assigned to someone else
                if (activeTask.technician_id && String(activeTask.technician_id) !== String(user.id)) {
                    alert('Unauthorized: You can only update your own assigned tasks.');
                    setTasks(originalTasks);
                    return;
                }
                // Must be assigned to move tasks
                if (!activeTask.technician_id) {
                    alert('This task is unassigned. Please wait for your Team Lead to delegate it.');
                    setTasks(originalTasks);
                    return;
                }
            }

            setTasks(tasks.map(t =>
                t.id === active.id ? { ...t, status: newStatus } : t
            ));

            // API Call
            try {
                // --- ROLE-BASED TRANSITION GUARDS (ADHERING TO MATRIX) ---

                // Super Admin: Global Override (No restrictions)
                if (user.role === 'SUPER_ADMIN') {
                    // Allow all
                }
                // Team Admin: Team-Specific Management
                else if (user.role === 'TEAM_LEAD') {
                    // Guard: Ensure task belongs to their team (already filtered in view, but safety first)
                    if (activeTask.team_id !== user.team_id) {
                        alert('Unauthorized: You can only moderate your own team workflow.');
                        setTasks(originalTasks);
                        return;
                    }
                }
                // Technician: Execution-Level Only - Guards already applied above for optimistic update

                let durationHours = activeTask.duration_hours;

                // Prompt for hours if moving to done state
                if ((newStatus === 'repaired' || newStatus === 'scrap') && !durationHours) {
                    const input = prompt("Please log hours spent on this task:", "0.5");
                    if (input === null) {
                        setTasks(originalTasks); // Revert
                        return;
                    }
                    durationHours = parseFloat(input);
                    if (isNaN(durationHours)) {
                        alert("Invalid hours. Reverting.");
                        setTasks(originalTasks);
                        return;
                    }
                }

                const res = await fetch(`http://localhost:5000/api/requests/${active.id}/status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Role': user.role,
                        'X-User-Id': user.id,
                        'X-User-Team-Id': user.team_id || ''
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        duration_hours: durationHours
                    }),
                });

                if (!res.ok) throw new Error('Action Unauthorized or Server Error');
                fetchData(true); // Silent Refresh after action
            } catch (error) {
                alert(`Update failed: ${error.message}`);
                setTasks(originalTasks);
            }
        };
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
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Sync • {format(lastSynced, 'HH:mm:ss')}</span>
                        </div>
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
                    {(user.role === 'SUPER_ADMIN' || user.role === 'TEAM_LEAD') && (
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

            {/* Phase T: Triage Zone (Admins Only) */}
            {triageTasks.length > 0 && (
                <div className="mb-8 border-2 border-orange-300 bg-orange-50 rounded-sm p-4 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3 mb-4 border-b border-orange-200 pb-2">
                        <AlertCircle className="text-orange-600" />
                        <div>
                            <h3 className="text-lg font-black text-orange-800 uppercase tracking-widest">Triage / Needs Review</h3>
                            <p className="text-xs font-bold text-orange-600/80 uppercase tracking-wide">
                                These requests need to be routed to a responsible squad.
                            </p>
                        </div>
                        <span className="ml-auto bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full">{triageTasks.length} PENDING</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {triageTasks.map(task => (
                            <KanbanCard
                                key={task.id}
                                {...task}
                                equipment={task.equipment_name}
                                technician={task.technician_name}
                                onRoute={handleRoute}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border-2 border-red-500 p-4 flex items-center gap-3 animate-bounce">
                    <XCircle size={18} className="text-red-500" />
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">{error}</p>
                </div>
            )}

            {/* KPI Bar */}
            {(user.role === 'SUPER_ADMIN' || user.role === 'TEAM_LEAD') && (
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
                                onCreateFollowUp={handleCreateFollowUp}
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
                                workCenter={activeTask.work_center}
                                created_at={activeTask.created_at}
                                picked_up_at={activeTask.picked_up_at}
                                completed_at={activeTask.completed_at}
                                onAssign={null} // Disable actions while dragging
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <MaintenanceRequestModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setFollowUpData(null); }}
                onSuccess={fetchData}
                followUpData={followUpData}
            />

            <AssignTechnicianModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onAssign={submitAssignment}
                teamId={assignContext.teamId}
            />
            {/* Routing Modal (Simple Team Selection) */}
            {isRouteModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm">
                    <div className="bg-white border-2 border-brand-text w-full max-w-sm rounded-sm overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="p-4 border-b-2 border-brand-border bg-gray-50 flex justify-between items-center">
                            <h3 className="text-sm font-black text-brand-text uppercase tracking-widest">Route Request</h3>
                            <button onClick={() => setIsRouteModalOpen(false)}><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-xs font-bold text-brand-muted uppercase">Select the Squad responsible for this request:</p>
                            <div className="space-y-2">
                                {teams.filter(t => t.name !== 'Triage Squad').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => submitRouting(t.id)}
                                        className="w-full text-left px-4 py-3 border-2 border-brand-border rounded-sm hover:border-brand-primary hover:bg-brand-primary/5 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-between group"
                                    >
                                        {t.name} Squad
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-primary">→</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanPage;
