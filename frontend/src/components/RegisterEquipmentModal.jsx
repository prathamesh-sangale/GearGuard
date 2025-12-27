import React, { useState, useEffect } from 'react';
import { X, Database, Building2, MapPin, User, Calendar, ShieldCheck, Users } from 'lucide-react';

const RegisterEquipmentModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: 'Robotic Welding Unit - Line 5',
        serial_number: 'WELD-R-501',
        department: 'Assembly',
        location: 'Zone B, Section 2',
        employee_name: 'P. Sharma (Line Supervisor)',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_info: '3-Year Parts & Labor',
        maintenance_team_id: ''
    });
    const [teams, setTeams] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:5000/api/teams')
                .then(res => res.json())
                .then(data => setTeams(data))
                .catch(err => console.error('Error fetching teams:', err));
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    maintenance_team_id: formData.maintenance_team_id ? parseInt(formData.maintenance_team_id) : null
                }),
            });

            if (!res.ok) throw new Error('Failed to register equipment');

            onSuccess();
            onClose();
            setFormData({
                name: 'Robotic Welding Unit - Line 5',
                serial_number: 'WELD-R-501',
                department: 'Assembly',
                location: 'Zone B, Section 2',
                employee_name: 'P. Sharma (Line Supervisor)',
                purchase_date: new Date().toISOString().split('T')[0],
                warranty_info: '3-Year Parts & Labor',
                maintenance_team_id: ''
            });
        } catch (error) {
            console.error('Submit error:', error);
            alert('Error registering equipment');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-text/40 backdrop-blur-sm overflow-y-auto">
            <div className="my-8 w-full max-w-2xl">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white border-2 border-brand-text rounded-sm flex flex-col overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                    {/* Modal Header */}
                    <div className="p-6 border-b-2 border-brand-border bg-gray-50 flex justify-between items-center">
                        <div>
                            <h2 className="text-sm font-black text-brand-text uppercase tracking-widest">Asset Enrollment</h2>
                            <p className="text-[10px] font-bold text-brand-muted uppercase tracking-tight mt-1">Register production machine or robotic unit</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 border-2 border-brand-border rounded-sm hover:border-brand-primary hover:text-brand-primary transition-all text-brand-muted"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Asset Name</label>
                            <div className="relative">
                                <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="E.G. ROBOTIC WELDING ARM – LINE 3"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Serial Number</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    value={formData.serial_number}
                                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                    placeholder="SN-XXXXX-X"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Department</label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    required
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="PRODUCTION / LOGISTICS"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Factory Zone / Bay</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    required
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="ZONE B, SECTION 4"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Primary Line Operator</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    value={formData.employee_name}
                                    onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                                    placeholder="OPERATOR NAME"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Purchase Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Responsible Team</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <select
                                    value={formData.maintenance_team_id}
                                    onChange={(e) => setFormData({ ...formData, maintenance_team_id: e.target.value })}
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all appearance-none"
                                >
                                    <option value="">SELECT TEAM...</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Warranty Info</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                                <input
                                    type="text"
                                    value={formData.warranty_info}
                                    onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                                    placeholder="E.G. 2 YEAR FULL SERVICE"
                                    className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all"
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
                            disabled={submitting}
                            className="flex-1 bg-brand-primary text-white border-2 border-brand-primary py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                        >
                            {submitting ? 'Registering...' : 'Complete Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterEquipmentModal;
