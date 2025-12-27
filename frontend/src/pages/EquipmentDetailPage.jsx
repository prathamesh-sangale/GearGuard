import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layout, Settings, ShieldCheck, Map, Users, Info, Trash2 } from 'lucide-react';

const EquipmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/equipment/${id}`)
            .then(res => res.json())
            .then(data => {
                setItem(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching equipment detail:', err);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="w-8 h-8 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-10 border-2 border-dashed border-brand-border rounded-sm text-center">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Asset Not Found</p>
                <button onClick={() => navigate('/equipment')} className="mt-4 text-brand-primary font-black text-[10px] uppercase underline">Return to List</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Navigation & Actions */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/equipment')}
                    className="flex items-center gap-2 p-2 border-2 border-brand-border rounded-sm text-[10px] font-black uppercase tracking-widest hover:border-brand-primary transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Inventory
                </button>

                <div className="flex gap-2">
                    <button className="p-2 border-2 border-brand-border rounded-sm text-brand-muted hover:border-red-500 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                    </button>
                    <button className="p-2 border-2 border-brand-border rounded-sm text-brand-muted hover:border-brand-primary hover:text-brand-primary transition-all">
                        <Settings size={16} />
                    </button>
                </div>
            </div>

            {/* Main Identity Block */}
            <div className="bg-white border-2 border-brand-border rounded-sm p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className={`w-20 h-20 border-2 ${item.is_scrapped ? 'border-red-200 bg-red-50 text-red-500' : 'border-brand-primary/20 bg-brand-primary/5 text-brand-primary'} rounded-sm flex items-center justify-center text-2xl font-black`}>
                        EQ-{item.id}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-brand-text uppercase tracking-tighter">{item.name}</h1>
                            <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mt-1">S/N: {item.serial_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-y-6 mt-4">
                            <div>
                                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Status</p>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full border-2 ${item.is_scrapped ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.is_scrapped ? 'SCRAPPED' : 'OPERATIONAL'}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Assigned Employee</p>
                                <p className="text-sm font-black text-brand-text uppercase">{item.employee_name || 'Unassigned'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Purchase Date</p>
                                <p className="text-sm font-black text-brand-text uppercase">{item.purchase_date || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] mb-1">Warranty Info</p>
                                <p className="text-sm font-black text-brand-text uppercase">{item.warranty_info || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smart Button */}
                <button
                    onClick={() => navigate(`/?equipmentId=${item.id}`)}
                    className={`bg-brand-text text-white p-1 rounded-sm flex items-center group overflow-hidden border-2 border-brand-text ${item.is_scrapped ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={item.is_scrapped}
                >
                    <div className="bg-white/10 px-6 py-4 flex flex-col items-center justify-center border-r border-white/10 min-w-[100px]">
                        <span className="text-xl font-black leading-none">{item.open_requests_count || 0}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-60">Open Requests</span>
                    </div>
                    <div className="px-6 py-4 flex items-center gap-3 group-hover:bg-brand-primary transition-all">
                        <Layout size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">View in Kanban</span>
                    </div>
                </button>
            </div>

            {/* Technical Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Spec Card */}
                <div className="bg-white border-2 border-brand-border rounded-sm p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-brand-border pb-4">
                        <Info size={16} className="text-brand-primary" />
                        <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em]">Technical Data</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Department</label>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck size={14} className="text-brand-muted" />
                                <span className="text-[10px] font-black uppercase">{item.department}</span>
                            </div>
                        </div>
                        <div>
                            <label className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Specific Location</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Map size={14} className="text-brand-muted" />
                                <span className="text-[10px] font-black uppercase">{item.location}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Card */}
                <div className="bg-white border-2 border-brand-border rounded-sm p-6 space-y-6">
                    <div className="flex items-center gap-2 border-b-2 border-brand-border pb-4">
                        <Users size={16} className="text-brand-primary" />
                        <h3 className="text-[10px] font-black text-brand-text uppercase tracking-[0.2em]">Assigned Maintenance</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Responsive Team</label>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-6 h-6 bg-brand-primary/10 rounded-sm flex items-center justify-center text-brand-primary text-[8px] font-black">
                                    {item.team_name?.charAt(0) || 'U'}
                                </div>
                                <span className="text-[10px] font-black uppercase">{item.team_name || 'UNASSIGNED'}</span>
                            </div>
                        </div>
                        <p className="text-[9px] font-medium text-brand-muted leading-relaxed">
                            This asset is primary managed by the {item.team_name || 'Generic'} maintenance squad. All corrective and preventive schedules are routed through this unit.
                        </p>
                    </div>
                </div>

                {/* History Placeholder */}
                <div className="bg-white border-2 border-brand-border border-dashed rounded-sm p-6 flex flex-col items-center justify-center text-center">
                    <Settings size={28} className="text-brand-border mb-3" />
                    <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Lifecycle Log</h3>
                    <p className="text-[8px] font-bold text-brand-muted/60 uppercase mt-2">No historical records available</p>
                </div>
            </div>
        </div>
    );
};

export default EquipmentDetailPage;
