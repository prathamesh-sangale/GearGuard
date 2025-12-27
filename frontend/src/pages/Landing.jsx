import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl w-full bg-white shadow-xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-odoo-purple p-12 text-white flex flex-col justify-center">
                    <h1 className="text-5xl font-bold mb-6">GearGuard</h1>
                    <p className="text-xl mb-8 opacity-90">
                        Professional Maintenance Management System.
                        Streamlined workflows for tracking equipment, tickets, and scheduled maintenance.
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-white text-odoo-purple px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all">
                            Launch App
                        </button>
                        <button className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-odoo-purple transition-all">
                            Documentation
                        </button>
                    </div>
                </div>
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="bg-odoo-purple bg-opacity-10 p-3 rounded-lg">
                                <span className="text-odoo-purple font-bold">01</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Dynamic Workflows</h3>
                                <p className="text-sm text-gray-600">Odoo-style kanban boards for maintenance tickets.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-odoo-purple bg-opacity-10 p-3 rounded-lg">
                                <span className="text-odoo-purple font-bold">02</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Equipment Inventory</h3>
                                <p className="text-sm text-gray-600">Full visibility into all machinery and tools.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-odoo-purple bg-opacity-10 p-3 rounded-lg">
                                <span className="text-odoo-purple font-bold">03</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">Strict Validation</h3>
                                <p className="text-sm text-gray-600">Zod-powered input validation for reliable data.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="mt-8 text-gray-400 text-sm">
                Odoo x Adani University Hackathon 2025
            </p>
        </div>
    );
};

export default Landing;
