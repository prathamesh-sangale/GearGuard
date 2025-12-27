import React, { useState, useEffect } from 'react';
import { X, Calendar, Wrench, Layout, AlertTriangle, CheckSquare } from 'lucide-react';

const MaintenanceRequestModal = ({ isOpen, onClose, selectedDate, onSuccess, initialType = 'corrective' }) => {
    const [subject, setSubject] = useState('COOLING FAN VIBRATION');
    const [equipmentId, setEquipmentId] = useState('');
    const [type, setType] = useState(initialType);
    const [date, setDate] = useState('');
    const [equipmentList, setEquipmentList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:5000/api/equipment')
                .then(res => res.json())
                .then(data => setEquipmentList(data.filter(eq => !eq.is_scrapped)))
                .catch(err => console.error('Error fetching equipment list:', err));

            if (selectedDate) {
                setDate(selectedDate.toISOString().split('T')[0]);
            } else {
                setDate(new Date().toISOString().split('T')[0]);
            }
            setType(initialType);
        }
    }, [isOpen, selectedDate, initialType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!subject || !equipmentId) return;

        setSubmitting(true);
        try {
            const res = await fetch('http://localhost:5000/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: subject.toUpperCase(),
                    equipment_id: parseInt(equipmentId),
                    type: type,
                    scheduled_date: date
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
            setSubmitting(false);
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
                                className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider"
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
                                className="w-full bg-gray-50 border-2 border-brand-border rounded-sm py-3 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all tracking-wider appearance-none"
                            >
                                <option value="">SELECT EQUIPMENT...</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.name} ({eq.serial_number})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">Execution Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={14} />
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
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
                        disabled={submitting}
                        className="flex-1 bg-brand-text text-white border-2 border-brand-text py-3 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all disabled:opacity-50"
                    >
                        {submitting ? 'Creating...' : 'Confirm Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MaintenanceRequestModal;
