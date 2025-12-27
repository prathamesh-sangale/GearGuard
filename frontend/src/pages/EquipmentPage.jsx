import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, Search, ChevronRight, MapPin, Building2 } from 'lucide-react';
import RegisterEquipmentModal from '../components/RegisterEquipmentModal';

const EquipmentPage = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchEquipment = () => {
        fetch('http://localhost:5000/api/equipment')
            .then(res => res.json())
            .then(data => {
                setEquipment(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching equipment:', err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchEquipment();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Scanning Factory Assets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-brand-text uppercase tracking-tighter">Asset Inventory – AutoMotion Motors</h1>
                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest mt-1">Production Equipment & Assembly Line Assets</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-primary text-white border-2 border-brand-primary px-6 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all font-sans"
                >
                    <Plus size={16} />
                    Register Factory Asset
                </button>
            </div>

            {/* Stats/Filters Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-brand-border p-6 rounded-sm flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-brand-primary/10 bg-brand-primary/5 rounded-sm flex items-center justify-center text-brand-primary">
                        <Database size={20} />
                    </div>
                    <div>
                        <div className="text-xl font-black tracking-tighter">{equipment.length}</div>
                        <div className="text-[8px] font-black text-brand-muted uppercase tracking-[0.2em]">Total Units</div>
                    </div>
                </div>
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
                    <input
                        type="text"
                        placeholder="SEARCH BY MACHINE NAME, SERIAL, OR PRODUCTION DEPT..."
                        className="w-full bg-white border-2 border-brand-border rounded-sm py-4 pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-brand-primary transition-all"
                    />
                </div>
            </div>

            {/* Assets Table/Grid */}
            <div className="bg-white border-2 border-brand-border rounded-sm overflow-hidden">
                <div className="grid grid-cols-12 bg-gray-50 border-b-2 border-brand-border px-6 py-4">
                    <div className="col-span-5 text-[10px] font-black text-brand-muted uppercase tracking-widest">Asset Name</div>
                    <div className="col-span-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">Department</div>
                    <div className="col-span-3 text-[10px] font-black text-brand-muted uppercase tracking-widest">Location</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y-2 divide-brand-border">
                    {equipment.length > 0 ? (
                        equipment.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => navigate(`/equipment/${item.id}`)}
                                className="grid grid-cols-12 px-6 py-6 items-center hover:bg-gray-50/50 cursor-pointer group transition-all"
                            >
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className={`w-10 h-10 border-2 ${item.is_scrapped ? 'border-red-200 bg-red-50 text-red-500' : 'border-brand-border bg-white text-brand-text'} rounded-sm flex items-center justify-center font-black text-xs`}>
                                        EQ-{item.id}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-brand-text uppercase group-hover:text-brand-primary transition-colors">{item.name}</h3>
                                        <p className="text-[9px] font-medium text-brand-muted mt-0.5 tracking-wider">{item.serial_number}</p>
                                    </div>
                                </div>

                                <div className="col-span-3 text-[10px] font-bold text-brand-text uppercase tracking-wider flex items-center gap-2">
                                    <Building2 size={12} className="text-brand-muted" />
                                    {item.department}
                                </div>

                                <div className="col-span-3 text-[10px] font-bold text-brand-text uppercase tracking-wider flex items-center gap-2">
                                    <MapPin size={12} className="text-brand-muted" />
                                    {item.location}
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <ChevronRight size={16} className="text-brand-border group-hover:text-brand-primary translate-x-0 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-20 flex flex-col items-center justify-center opacity-30">
                            <Database size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Assets Found</p>
                        </div>
                    )}
                </div>
            </div>

            <RegisterEquipmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchEquipment}
            />
        </div>
    );
};

export default EquipmentPage;
