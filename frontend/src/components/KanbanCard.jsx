import React from 'react';
import { User, Clock, AlertCircle, Users } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useUser } from '../context/UserContext';

const KanbanCard = ({ id, subject, equipment, technician, teamId, teamName, date, isOverdue, status, onAssign }) => {
  const { user } = useUser();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition
  } : undefined;

  const handlePickUp = (e) => {
    e.stopPropagation();
    if (onAssign) onAssign(id, teamId);
  };

  // Permission Logic: Only Super Admin or Team Lead of THIS squad can assign
  const canAssign = user.role === 'SUPER_ADMIN' || (user.role === 'TEAM_ADMIN' && user.team_id === teamId);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 ${isDragging ? 'border-brand-primary opacity-50 z-50 rotate-3' : isOverdue ? 'border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'border-brand-border'} rounded-sm p-5 cursor-grab active:cursor-grabbing hover:border-brand-text transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      {...attributes}
      {...listeners}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-2">
        <h4 className={`text-[11px] font-black uppercase leading-relaxed tracking-wider group-hover:text-brand-primary transition-colors pr-2 ${isOverdue ? 'text-red-600' : 'text-brand-text'}`}>
          {subject || "Asset Repair Operation"}
        </h4>
        {isOverdue && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex-shrink-0 bg-red-500 p-1.5 rounded-sm ring-2 ring-red-100 animate-pulse">
              <Clock size={12} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Squad Badge */}
      <div className="mb-4 flex items-center gap-1.5">
        <span className="bg-gray-100 text-gray-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-200">
          {teamName || "General"} SQUAD
        </span>
        {!technician ? (
          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest ring-1 ring-red-100 px-1.5 py-0.5 rounded-sm bg-red-50/50">Unassigned</span>
        ) : (
          <span className="text-[8px] font-black text-green-600 uppercase tracking-widest ring-1 ring-green-100 px-1.5 py-0.5 rounded-sm bg-green-50/50">Assigned</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Equipment Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-wider">{equipment || "Engine Line Asset #001"}</span>
          </div>
          {/* Assignment Control: Only for Leads/Admins */}
          {!technician && canAssign && (
            <button
              onClick={handlePickUp}
              className="px-2 py-0.5 border-2 border-brand-text text-[8px] font-black uppercase tracking-widest hover:bg-brand-text hover:text-white transition-all pointer-events-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-0.5"
            >
              Assign
            </button>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-4 border-t border-brand-bg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-text text-white rounded-sm border-2 border-brand-text flex items-center justify-center text-[8px] font-black uppercase">
              {technician ? technician.split(' ').map(n => n[0]).join('') : '??'}
            </div>
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tight">{technician || "Unassigned"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-brand-muted">
            <Clock size={10} />
            <span className="text-[9px] font-black uppercase tracking-tight">{date || "DEC 27"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
