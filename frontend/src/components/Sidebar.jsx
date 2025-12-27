import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Database,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Zap,
    Layout,
    Car,
    Activity,
    Cog
} from 'lucide-react';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const navItems = [
        { label: 'Production Board', icon: Activity, to: '/' },
        { label: 'Service Schedule', icon: Calendar, to: '/calendar' },
        { label: 'Line Assets', icon: Database, to: '/equipment' },
    ];

    return (
        <aside
            className={`h-screen bg-white flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 border-r border-brand-border ${isCollapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Sidebar Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 bg-white border border-brand-border rounded-sm p-0.5 text-gray-400 hover:text-brand-primary transition-all"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Brand Section */}
            <div className={`py-10 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-8'}`}>
                <div className="w-8 h-8 bg-brand-text rounded-md flex items-center justify-center text-white flex-shrink-0 border-2 border-brand-text shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Car size={18} fill="currentColor" className="text-brand-primary" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tighter text-brand-text uppercase leading-none">AutoMotion</span>
                        <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em] mt-0.5">Manufacturing</span>
                    </div>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-10 overflow-hidden">
                <div>
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-md transition-all ${isActive
                                        ? 'text-brand-primary bg-brand-primary/5 border border-brand-primary/10'
                                        : 'text-brand-muted hover:text-brand-text hover:bg-gray-50 border border-transparent'
                                        } ${isCollapsed ? 'justify-center px-0' : ''}`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                            {!isCollapsed && <span className="font-bold text-sm tracking-wide">{item.label}</span>}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            {isCollapsed && (
                <div className="p-4 border-t border-brand-border flex justify-center">
                    <div className="w-10 h-10 rounded-md bg-transparent border border-brand-border flex items-center justify-center text-brand-muted hover:text-brand-primary transition-colors cursor-pointer">
                        <Settings size={18} />
                    </div>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
