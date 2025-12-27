import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { User, Settings, Phone, Circle, CreditCard } from 'lucide-react';

const RightBar = () => {
    const actions = [
        { label: 'USER', icon: User },
        { label: 'SETTINGS', icon: Settings },
        { label: 'HELP', icon: Phone, active: true },
        { label: 'STATUS', icon: Circle },
        { label: 'BILLING', icon: CreditCard },
    ];

    return (
        <div className="w-20 h-screen fixed right-0 top-0 bg-white border-l border-brand-border flex flex-col items-center py-10 gap-8 z-20">
            <div className="w-10 h-10 bg-gray-100 border border-brand-border rounded-sm flex items-center justify-center text-brand-muted overflow-hidden mb-4">
                <User size={20} />
            </div>
            {actions.map((action, idx) => (
                <button
                    key={idx}
                    title={action.label}
                    className={`w-12 h-12 flex items-center justify-center transition-all ${action.active
                        ? 'bg-brand-primary text-white rounded-md border-2 border-white'
                        : 'bg-transparent text-brand-muted hover:text-brand-primary border border-transparent'
                        }`}
                >
                    <action.icon size={20} strokeWidth={2.5} />
                </button>
            ))}
        </div>
    );
};

const AppLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-brand-bg flex overflow-hidden font-sans antialiased text-brand-text">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <div
                className={`flex-1 flex flex-col h-screen overflow-y-auto transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}
            >
                <Header />
                <main className="flex-1 p-10">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
