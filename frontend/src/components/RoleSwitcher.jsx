import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Shield, Users, User, ChevronUp, ChevronDown, Check, Briefcase, Wrench } from 'lucide-react';

const RoleSwitcher = () => {
    const { user, setUser } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    // FULL MASTER DATA ROSTER (Matching db.js exactly)
    const personas = [
        // SUPER ADMIN
        { category: 'Strategic Leadership', id: 'SA-001', name: 'Aman Patel', role: 'SUPER_ADMIN', team_id: null, team_name: 'Global HQ' },

        // TEAM LEADS
        { category: 'Squad Commanders', id: 'TL-MECH-01', name: 'Rahul Sharma', role: 'TEAM_LEAD', team_id: 1, team_name: 'Mechanical' },
        { category: 'Squad Commanders', id: 'TL-ELEC-01', name: 'Amit Verma', role: 'TEAM_LEAD', team_id: 2, team_name: 'Electrical' },
        { category: 'Squad Commanders', id: 'TL-IT-01', name: 'Pooja Nair', role: 'TEAM_LEAD', team_id: 3, team_name: 'IT' },
        { category: 'Squad Commanders', id: 'TL-FAC-01', name: 'Suresh Iyer', role: 'TEAM_LEAD', team_id: 4, team_name: 'Facilities' },

        // TECHNICIANS - Mechanical
        { category: 'Mechanical Squad', id: 'TECH-MECH-01', name: 'Varma Singh', role: 'TECHNICIAN', team_id: 1, team_name: 'Mechanical' },
        { category: 'Mechanical Squad', id: 'TECH-MECH-02', name: 'Deepak Yadav', role: 'TECHNICIAN', team_id: 1, team_name: 'Mechanical' },
        { category: 'Mechanical Squad', id: 'TECH-MECH-03', name: 'Rohit Patil', role: 'TECHNICIAN', team_id: 1, team_name: 'Mechanical' },

        // TECHNICIANS - Electrical
        { category: 'Electrical Squad', id: 'TECH-ELEC-01', name: 'Ankit Joshi', role: 'TECHNICIAN', team_id: 2, team_name: 'Electrical' },
        { category: 'Electrical Squad', id: 'TECH-ELEC-02', name: 'Pradeep Kumar', role: 'TECHNICIAN', team_id: 2, team_name: 'Electrical' },
        { category: 'Electrical Squad', id: 'TECH-ELEC-03', name: 'Sandeep Mishra', role: 'TECHNICIAN', team_id: 2, team_name: 'Electrical' },

        // TECHNICIANS - IT
        { category: 'IT Squad', id: 'TECH-IT-01', name: 'Kunal Mehta', role: 'TECHNICIAN', team_id: 3, team_name: 'IT' },
        { category: 'IT Squad', id: 'TECH-IT-02', name: 'Riya Desai', role: 'TECHNICIAN', team_id: 3, team_name: 'IT' },
        { category: 'IT Squad', id: 'TECH-IT-03', name: 'Abhishek Rao', role: 'TECHNICIAN', team_id: 3, team_name: 'IT' },

        // TECHNICIANS - Facilities
        { category: 'Facilities Squad', id: 'TECH-FAC-01', name: 'Mahesh Kulkarni', role: 'TECHNICIAN', team_id: 4, team_name: 'Facilities' },
        { category: 'Facilities Squad', id: 'TECH-FAC-02', name: 'Sunita Pawar', role: 'TECHNICIAN', team_id: 4, team_name: 'Facilities' },
        { category: 'Facilities Squad', id: 'TECH-FAC-03', name: 'Irfan Shaikh', role: 'TECHNICIAN', team_id: 4, team_name: 'Facilities' },
    ];

    const handleSwitch = (persona) => {
        setUser(persona);
        setIsOpen(false);
    };

    const getIcon = (role) => {
        switch (role) {
            case 'SUPER_ADMIN': return <Shield size={14} className="text-red-500" />;
            case 'TEAM_LEAD': return <Briefcase size={14} className="text-brand-primary" />;
            case 'TECHNICIAN': return <Wrench size={14} className="text-gray-500" />;
            default: return <User size={14} className="text-brand-muted" />;
        }
    };

    // Grouping
    const groupedPersonas = personas.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {});

    return (
        <div className="fixed bottom-6 right-6 z-[1000]">
            <div className={`bg-white border-2 border-brand-text rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-2' : 'scale-75 opacity-0 h-0 w-0 overflow-hidden'}`}>
                <div className="p-4 border-b-2 border-brand-border bg-gray-50">
                    <h3 className="text-[10px] font-black text-brand-text uppercase tracking-widest">Select User Persona</h3>
                </div>
                <div className="max-h-[500px] overflow-y-auto w-[280px]">
                    {Object.entries(groupedPersonas).map(([category, people]) => (
                        <div key={category}>
                            <div className="bg-brand-bg/50 px-4 py-2 border-b border-brand-border/50 sticky top-0 backdrop-blur-sm z-10">
                                <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">{category}</span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {people.map((p) => (
                                    <button
                                        key={p.id}
                                        onClick={() => handleSwitch(p)}
                                        className={`w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-all ${user.id === p.id ? 'bg-brand-primary/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-sm border-2 flex items-center justify-center shrink-0 ${user.id === p.id ? 'border-brand-primary bg-white' : 'border-brand-border bg-white'}`}>
                                                {getIcon(p.role)}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <div className="text-[10px] font-black text-brand-text uppercase leading-none truncate w-full">{p.name}</div>
                                                <div className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1 truncate">
                                                    {p.role === 'TEAM_LEAD' ? 'LEAD' : p.role === 'SUPER_ADMIN' ? 'ADMIN' : 'TECH'} • {p.team_name}
                                                </div>
                                            </div>
                                        </div>
                                        {user.id === p.id && <Check size={14} className="text-brand-primary ml-2" />}
                                    </button>
                                ))}
                            </div>
                        </div>
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
                        <div className="text-[8px] font-bold opacity-70 uppercase tracking-tighter mt-1">{user.role.replace('_', ' ')}: {user.name.split(' ')[0]}</div>
                    </div>
                </div>
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
        </div>
    );
};

export default RoleSwitcher;
