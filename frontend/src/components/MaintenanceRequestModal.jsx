import React, { useState, useEffect } from 'react';
import { X, Calendar, Wrench, Layout, AlertTriangle, CheckSquare, Users, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

const MaintenanceRequestModal = ({ isOpen, onClose, onSuccess, followUpData = null, selectedDate = null, initialType = 'corrective' }) => {
    const [subject, setSubject] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [type, setType] = useState('corrective');
    const [scheduledDate, setScheduledDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [equipmentList, setEquipmentList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState(null);
    const [teamId, setTeamId] = useState('');
    const [technicianId, setTechnicianId] = useState('');
    const [technicianList, setTechnicianList] = useState([]);
    const { user } = useUser();

    const fetchEquipment = () => {
        const headers = {
            'X-User-Role': user.role,
            'X-User-Id': user.id,
            'X-User-Team-Id': user.team_id || ''
        };
        fetch('http://localhost:5000/api/equipment', { headers })
            .then(res => res.json())
            .then(data => setEquipmentList(data))
            .catch(err => console.error('Error fetching equipment:', err));
    };

    useEffect(() => {
        if (isOpen) {
            const headers = {
                'X-User-Role': user.role,
                'X-User-Id': user.id,
                'X-User-Team-Id': user.team_id || ''
            };
            fetch('http://localhost:5000/api/teams', { headers })
                .then(res => res.json())
                .then(data => setTeams(data))
                .catch(err => console.error('Error fetching teams:', err));

            // Fetch technicians if user is Admin/Lead
            if (user.role === 'SUPER_ADMIN' || user.role === 'TEAM_LEAD') {
                fetch('http://localhost:5000/api/technicians', { headers })
                    .then(res => res.ok ? res.json() : [])
                    .then(data => setTechnicianList(Array.isArray(data) ? data : []))
                    .catch(err => {
                        console.error('Error fetching technicians:', err);
                        setTechnicianList([]);
                    });
            }

            fetchEquipment();

            if (followUpData) {
                setSubject(`Follow-up: ${followUpData.subject}`);
                setEquipmentId(followUpData.equipmentId);
                setType('corrective');
            } else {
                // Only reset if NOT a follow-up (persist defaults or clear)
                // The original code had a default state. Let's respect "initialType".
                if (selectedDate) {
                    setScheduledDate(selectedDate.toISOString().split('T')[0]);
                } else {
                    setScheduledDate(new Date().toISOString().split('T')[0]);
                }
                setType(initialType);

                // Enforce Team Lead Squad Lock
                if (user.role === 'TEAM_LEAD' && user.team_id) {
                    setTeamId(user.team_id);
                }
            }
        }
    }, [isOpen, selectedDate, initialType, user, followUpData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation - Matrix Implementation
        if (!subject.trim()) {
            setError("Request Subject is required.");
            return;
        }
        if (!equipmentId) {
            setError("Please select the affected Factory Asset.");
            return;
        }
        if (!teamId) {
            setError("Please select the responsible Squad.");
            return;
        }
        if (type === 'preventive' && !scheduledDate) {
            setError("Preventive Maintenance requires a scheduled execution date.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Role': user.role,
                    'X-User-Id': user.id,
                    'X-User-Team-Id': user.team_id || ''
                },
                body: JSON.stringify({
                    subject: subject.toUpperCase(),
                    equipment_id: parseInt(equipmentId),
                    team_id: parseInt(teamId),
                    technician_id: technicianId || null,
                    type: type,
                    scheduled_date: scheduledDate
                }),
            });

            if (!res.ok) throw new Error('Failed to create request');

            onSuccess();
            onClose();
            // Reset form
            setSubject('COOLING FAN VIBRATION');
            setEquipmentId('');
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error creating request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm">
            <form
                onSubmit={handleSubmit}
                className="bg-white border-2 border-brand-text w-full max-w-md rounded-sm flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
                {/* Modal Header */}
                <div className="p-6 border-b-2 border-brand-border bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-black text-brand-text uppercase tracking-widest">New Maintenance Request</h2>
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-tight mt-1">Log a production line issue for AutoMotion</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 border-2 border-brand-border rounded-sm hover:border-brand-primary hover:text-brand-primary transition-all text-brand-muted"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-500 text-white px-8 py-3 flex items-center gap-3 animate-in slide-in-from-top duration-300">
                        <AlertTriangle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                )}

                {/* Modal Body */}
                <div className="p-8 space-y-6">
                    {/* Type Selector */}
                    <div className="flex border-2 border-brand-border rounded-sm overflow-hidden bg-gray-50">
                        <button
                            type="button"
                            onClick={() => setType('corrective')}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'corrective' ? 'bg-red-500 text-white' : 'text-brand-muted hover:text-brand-text'}`}
                        >
                            <AlertTriangle size={14} />
                            Corrective
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('preventive')}
                            className={`flex-1 py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${type === 'preventive' ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-text'}`}
                        >
                            <CheckSquare size={14} />
                            Preventive
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Request Subject</label>
                        <div className="relative">
                            <Layout className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="E.G. WELDING ARM VIBRATION"
                                className={`w-full bg-gray-50 border-2 rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider ${!subject ? 'border-red-200 bg-red-50/30' : 'border-brand-border'}`}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Equipment</label>
                        <div className="relative">
                            <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                            <select
                                required
                                value={equipmentId}
                                onChange={(e) => setEquipmentId(e.target.value)}
                                className={`w-full bg-gray-50 border-2 rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider appearance-none ${!equipmentId ? 'border-red-200 bg-red-50/30' : 'border-brand-border'}`}
                            >
                                <option value="">SELECT EQUIPMENT...</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Affected Squad (Mandatory)</label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                            <select
                                required
                                value={teamId}
                                disabled={user.role === 'TEAM_LEAD'}
                                onChange={(e) => {
                                    setTeamId(e.target.value);
                                    setTechnicianId(''); // Reset tech if team changes
                                }}
                                className={`w-full bg-gray-50 border-2 rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider appearance-none disabled:opacity-70 disabled:bg-gray-200 disabled:cursor-not-allowed ${!teamId ? 'border-red-200 bg-red-50/30' : 'border-brand-border'}`}
                            >
                                <option value="">SELECT RESPONSIBLE SQUAD...</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name === 'Triage Squad' ? '❓ NOT SURE / NEEDS REVIEW' : `${t.name} SQUAD`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {(user.role === 'SUPER_ADMIN' || user.role === 'TEAM_ADMIN') && teamId && (
                        <div className="space-y-1.5 animate-in slide-in-from-top-1 duration-200">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Assign Technician (Optional)</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <select
                                    value={technicianId}
                                    onChange={(e) => setTechnicianId(e.target.value)}
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider appearance-none"
                                >
                                    <option value="">LEAVE UNASSIGNED...</option>
                                    {technicianList
                                        .filter(t => Number(t.team_id) === Number(teamId))
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (ID: #{t.id})</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Execution Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                            <input
                                type="date"
                                required
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t-2 border-brand-border bg-gray-50 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 border-2 border-brand-border bg-white py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:border-brand-text transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !teamId}
                        className="flex-1 bg-brand-text text-white border-2 border-brand-text py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Confirm Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceRequestModal;
