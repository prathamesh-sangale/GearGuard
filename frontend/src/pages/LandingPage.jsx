import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Hexagon, Shield, Activity, Zap } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-brand-bg flex flex-col relative overflow-hidden font-sans">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-10 py-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary text-white flex items-center justify-center rounded-lg shadow-lg shadow-brand-primary/25">
                        <Hexagon size={24} fill="currentColor" className="animate-pulse" />
                    </div>
                    <span className="text-xl font-black text-brand-text uppercase tracking-tighter">AutoMotion<span className="text-brand-primary">.MFG</span></span>
                </div>
                <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-brand-muted">
                    <a href="#" className="hover:text-brand-primary transition-colors">Solutions</a>
                    <a href="#" className="hover:text-brand-primary transition-colors">Platform</a>
                    <a href="#" className="hover:text-brand-primary transition-colors">Enterprise</a>
                </div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 border-2 border-brand-text/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-brand-text hover:text-white transition-all"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 mb-8 animate-in slide-in-from-bottom-5 fade-in duration-700">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
                    <span className="text-[9px] font-black uppercase tracking-widest">System Operational • v2.4.0</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-brand-text uppercase tracking-tighter leading-tight mb-6 max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-100">
                    Industry 4.0 <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">Maintenance Suite</span>
                </h1>

                <p className="text-base md:text-xl font-medium text-brand-muted max-w-2xl mb-12 leading-relaxed animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200">
                    The centralized command center for preventive maintenance, equipment tracking, and real-time technician deployment.
                </p>

                <div className="flex flex-col md:flex-row gap-6 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-300">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group relative px-8 py-4 bg-brand-primary text-white text-sm font-black uppercase tracking-widest rounded-sm overflow-hidden shadow-xl shadow-brand-primary/30 hover:shadow-2xl hover:shadow-brand-primary/40 hover:-translate-y-1 transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Enter Dashboard
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>

                    <button className="px-8 py-4 border-2 border-brand-text/10 text-brand-text text-sm font-black uppercase tracking-widest rounded-sm hover:bg-brand-text/5 transition-all">
                        View Documentation
                    </button>
                </div>

                {/* Features Grid */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left">
                    <div className="bg-white/50 backdrop-blur-sm border border-white/50 p-6 rounded-2xl hover:bg-white transition-all shadow-sm">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Activity size={20} /></div>
                        <h3 className="text-sm font-black text-brand-text uppercase mb-2">Real-time Monitoring</h3>
                        <p className="text-xs text-brand-muted leading-relaxed">Live status tracking of all production assets and assembly line performance.</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border border-white/50 p-6 rounded-2xl hover:bg-white transition-all shadow-sm">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4"><Shield size={20} /></div>
                        <h3 className="text-sm font-black text-brand-text uppercase mb-2">Preventive Safety</h3>
                        <p className="text-xs text-brand-muted leading-relaxed">Automated scheduling for inspections to prevent critical equipment failure.</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border border-white/50 p-6 rounded-2xl hover:bg-white transition-all shadow-sm">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4"><Zap size={20} /></div>
                        <h3 className="text-sm font-black text-brand-text uppercase mb-2">Rapid Response</h3>
                        <p className="text-xs text-brand-muted leading-relaxed">Instant technician dispatch and digitized workflow for corrective repairs.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 py-6 text-center">
                <p className="text-[9px] font-bold text-brand-muted/50 uppercase tracking-widest">
                    Authorized Personnel Only • AutoMotion Manufacturing Systems © 2025
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
