import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Shield, Users, User, ChevronUp, ChevronDown, Check } from 'lucide-react';

const RoleSwitcher = () => {
    const { user, setUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [personas, setPersonas] = useState([]);

    useEffect(() => {
        // Fetch technicians from the database to use as personas
        fetch('http://localhost:5000/api/requests') // We can infer techs from here or add a specific endpoint
            // Actually, for demo simplicity, let's just use hardcoded personas that match our seed
            .catch(err => console.error(err));

        setPersonas([
            { id: 1, name: 'Nikunj (Super Admin)', role: 'SUPER_ADMIN', team_id: null, team_name: 'All Access' },
            { id: 2, name: 'Rahul (Lead)', role: 'TEAM_ADMIN', team_id: 1, team_name: 'Mechanical' },
            { id: 3, name: 'Amit (Lead)', role: 'TEAM_ADMIN', team_id: 2, team_name: 'Electrical' },
            { id: 6, name: 'S. Varma', role: 'TECHNICIAN', team_id: 1, team_name: 'Mechanical' },
            { id: 7, name: 'K. Singh', role: 'TECHNICIAN', team_id: 2, team_name: 'Electrical' },
            { id: 9, name: 'M. Khan', role: 'TECHNICIAN', team_id: 4, team_name: 'Facilities' },
        ]);
    }, []);

    const activePersona = personas.find(p => p.role === user.role && p.id === user.id) || personas[0];

    const handleSwitch = (persona) => {
        setUser(persona);
        setIsOpen(false);
    };

    const getIcon = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return <Shield size={14} className="text-red-500" />;
            case 'TEAM_ADMIN': return <Users size={14} className="text-brand-primary" />;
            default: return <User size={14} className="text-brand-muted" />;
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            <div className={`bg-white border-2 border-brand-text rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all duration-300 ${isOpen ? 'mb-2 h-auto opacity-100' : 'h-0 opacity-0 overflow-hidden mb-0'}`}>
                <div className="p-4 border-b-2 border-brand-border bg-gray-50">
                    <h3 className="text-[10px] font-black text-brand-text uppercase tracking-widest">Select Demo Persona</h3>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y-2 divide-brand-border">
                    {personas.map((p) => (
                        <button
                            key={`${p.role}-${p.id}`}
                            onClick={() => handleSwitch(p)}
                            className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-all ${user.id === p.id && user.role === p.role ? 'bg-brand-primary/5' : ''}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-sm border-2 flex items-center justify-center ${user.id === p.id && user.role === p.role ? 'border-brand-primary bg-white' : 'border-brand-border bg-white'}`}>
                                    {getIcon(p.role)}
                                </div>
                                <div className="text-left">
                                    <div className="text-[10px] font-black text-brand-text uppercase leading-none">{p.name}</div>
                                    <div className="text-[8px] font-bold text-brand-muted uppercase tracking-tighter mt-1">
                                        {p.role.replace('_', ' ')} • {p.team_name}
                                    </div>
                                </div>
                            </div>
                            {user.id === p.id && user.role === p.role && <Check size={14} className="text-brand-primary" />}
                        </button>
                    ))}
                </div>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-brand-text text-white px-6 py-4 rounded-sm border-2 border-brand-text hover:bg-brand-primary hover:border-brand-primary transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-sm flex items-center justify-center">
                        {getIcon(user.role)}
                    </div>
                    <div className="text-left">
                        <div className="text-[10px] font-black tracking-widest uppercase leading-none">Persona Switcher</div>
                        <div className="text-[8px] font-bold opacity-70 uppercase tracking-tighter mt-1">{user.role.replace('_', ' ')}: {user.name}</div>
                    </div>
                </div>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
        </div>
    );
};

export default RoleSwitcher;
