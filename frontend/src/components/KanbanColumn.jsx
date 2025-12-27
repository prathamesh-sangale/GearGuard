import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, parseISO } from 'date-fns';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, title, requests = [], isDroppable = true, onAssign }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        disabled: !isDroppable
    });

    return (
        <div className={`flex-1 min-w-[280px] bg-white border-2 ${isOver ? 'border-brand-primary bg-brand-primary/5' : 'border-brand-border'} rounded-sm flex flex-col h-full min-h-[500px] transition-all`}>
            {/* Column Header */}
            <div className="p-4 border-b-2 border-brand-border bg-gray-50/50">
                <h3 className="text-xs font-black text-brand-text uppercase tracking-widest">{title}</h3>
            </div>

            {/* Cards Area */}
            <div
                ref={setNodeRef}
                className="p-4 flex-1 overflow-y-auto scrollbar-hide py-6 min-h-[200px]"
            >
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <KanbanCard
                            key={request.id}
                            id={request.id}
                            subject={request.subject}
                            equipment={request.equipment_name}
                            technician={request.technician_name}
                            teamId={request.team_id}
                            teamName={request.team_name}
                            date={request.scheduled_date ? format(parseISO(request.scheduled_date), 'MMM d') : '-'}
                            isOverdue={request.isOverdue}
                            status={request.status}
                            onAssign={onAssign}
                        />
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 pointer-events-none">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-1 bg-brand-border rounded-full" />
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">No Line Faults</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
