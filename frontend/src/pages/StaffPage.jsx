import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ChevronRight, Briefcase, Activity } from 'lucide-react';
import { useUser } from '../context/UserContext';

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState(new Date());
    const { user } = useUser();
    const navigate = useNavigate();

    const fetchStaff = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            const headers = {
                'X-User-Role': user.role,
                'X-User-Id': user.id
            };
            const res = await fetch('http://localhost:5000/api/admin/staff', { headers });
            if (res.ok) {
                const data = await res.json();
                setStaff(data);
                setLastSynced(new Date());
            } else {
                console.error("Failed to fetch staff");
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
        const interval = setInterval(() => {
            fetchStaff(true);
        }, 15000); // 15s refresh
        return () => clearInterval(interval);
    }, [user]);

    const getWorkStatus = (activeCount) => {
        if (activeCount === 0) return { label: 'IDLE', color: 'bg-gray-100 text-gray-500' };
        if (activeCount < 3) return { label: 'WORKING', color: 'bg-green-100 text-green-700' };
        return { label: 'OVERLOADED', color: 'bg-red-100 text-red-700' };
    };

    if (loading) return <div className="p-20 text-center text-xs font-black uppercase tracking-widest opacity-50">Loading Staff Data...</div>;

    if (user.role !== 'SUPER_ADMIN') {
        return <div className="p-20 text-center text-red-500 font-bold">Unauthorized Access</div>;
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-brand-text uppercase tracking-tighter">Global Staff Overview</h1>
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mt-1">Maintenance Team & Technician Workload</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200 ml-auto">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">Live Sync • {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-brand-border p-6 rounded-sm flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-brand-primary/10 bg-brand-primary/5 rounded-sm flex items-center justify-center text-brand-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <div className="text-xl font-black tracking-tighter">{staff.length}</div>
                        <div className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em]">Active Staff</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white border-2 border-brand-border rounded-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b-2 border-brand-border px-6 py-4">
                    <div className="col-span-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Staff Member</div>
                    <div className="col-span-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">Role & Squad</div>
                    <div className="col-span-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Current Load</div>
                    <div className="col-span-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">Status</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y-2 divide-brand-border">
                    {staff.map(person => {
                        const status = getWorkStatus(person.active_requests);
                        return (
                            <div
                                key={person.id}
                                onClick={() => navigate(`/?technicianId=${person.id}`)}
                                className="grid grid-cols-12 px-6 py-6 items-center hover:bg-gray-50/50 cursor-pointer group transition-all"
                            >
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-brand-text text-white flex items-center justify-center font-black text-xs">
                                        {person.name.charAt(0)}
                                    </div>
                                    <span className="text-sm font-black text-brand-text uppercase">{person.name}</span>
                                </div>

                                <div className="col-span-3">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase">{person.role}</span>
                                        <div className="flex items-center gap-1 text-[9px] text-brand-muted uppercase">
                                            <Briefcase size={10} />
                                            {person.team_name || 'No Squad'}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <span className="text-xl font-black tracking-tighter">{person.active_requests}</span>
                                    <span className="text-[8px] font-bold text-brand-muted uppercase ml-2">Tickets</span>
                                </div>

                                <div className="col-span-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wide ${status.color}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <ChevronRight size={16} className="text-brand-border group-hover:text-brand-primary" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StaffPage;
