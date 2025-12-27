import React from 'react';
import { ChevronLeft, ChevronRight, Bell, Search, User } from 'lucide-react';

const Header = () => {
    return (
        <header className="h-[80px] flex items-center justify-between px-12 bg-white border-b border-brand-border sticky top-0 z-20">
            <div className="flex items-center gap-8">
                <h1 className="text-xl font-black text-brand-text uppercase tracking-widest">Line Control Hub</h1>
                <div className="flex border border-brand-border rounded-sm overflow-hidden">
                    <button className="w-10 h-10 flex items-center justify-center bg-white text-brand-muted hover:bg-gray-50 border-r border-brand-border transition-all">
                        <ChevronLeft size={18} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white text-brand-muted hover:bg-gray-50 transition-all">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative group hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="SCAN ASSET OR LINE ID..."
                        className="bg-gray-50 border border-brand-border rounded-md py-2.5 pl-10 pr-4 text-xs font-bold uppercase focus:outline-none focus:border-brand-primary transition-all w-64 tracking-wider"
                    />
                </div>
                <button className="w-10 h-10 flex items-center justify-center bg-white text-brand-muted border border-brand-border rounded-md hover:border-brand-primary hover:text-brand-primary transition-all relative">
                    <Bell size={18} />
                    <div className="absolute top-1 right-1 w-2 h-2 bg-brand-secondary border border-white" />
                </button>
                <div className="w-10 h-10 bg-brand-primary rounded-md flex items-center justify-center text-white border border-brand-primary shadow-sm overflow-hidden">
                    <User size={20} />
                </div>
            </div>
        </header>
    );
};

export default Header;
