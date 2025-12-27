import React, { useState, useEffect } from 'react';
import { X, User, Check } from 'lucide-react';
import { useUser } from '../context/UserContext';

const AssignTechnicianModal = ({ isOpen, onClose, onAssign, teamId }) => {
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch('http://localhost:5000/api/technicians', {
                headers: {
                    'X-User-Role': user.role,
                    'X-User-Id': user.id,
                    'X-User-Team-Id': user.team_id || ''
                }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                    // Ensure data is array and filter by teamId
                    const list = Array.isArray(data) ? data : [];
                    setTechnicians(list.filter(t => Number(t.team_id) === Number(teamId)));
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error fetching technicians:', err);
                    setLoading(false);
                });
        }
    }, [isOpen, teamId, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm">
            <div className="bg-white border-2 border-brand-text w-full max-w-sm rounded-sm flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="p-4 border-b-2 border-brand-border bg-gray-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xs font-black text-brand-text uppercase tracking-widest">Assign Technician</h2>
                        <p className="text-[8px] font-bold text-brand-muted uppercase tracking-tighter mt-0.5">Select a squad member for this task</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 border-2 border-transparent hover:border-brand-border rounded-sm transition-all text-brand-muted hover:text-brand-text"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="max-h-[300px] overflow-y-auto p-2 space-y-2 bg-gray-50/50">
                    {loading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-50">
                            <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Fetching Squad...</span>
                        </div>
                    ) : technicians.length > 0 ? (
                        technicians.map((tech) => (
                            <button
                                key={tech.id}
                                onClick={() => onAssign(tech.id)}
                                className="w-full group flex items-center justify-between p-3 bg-white border-2 border-brand-border hover:border-brand-text hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-sm text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-bg rounded-sm border-2 border-brand-border flex items-center justify-center">
                                        <User size={14} className="text-brand-text" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-brand-text uppercase tracking-wider">{tech.name}</div>
                                        <div className="text-[8px] font-bold text-brand-muted uppercase tracking-tight">ID: #{tech.id} • {tech.role}</div>
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-brand-text text-white p-1 rounded-sm">
                                        <Check size={12} />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="py-8 text-center bg-white border-2 border-dashed border-brand-border rounded-sm">
                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">No Technicians Available</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t-2 border-brand-border bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border-2 border-brand-border bg-white text-[10px] font-black uppercase tracking-widest hover:border-brand-text transition-all rounded-sm"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssignTechnicianModal;
