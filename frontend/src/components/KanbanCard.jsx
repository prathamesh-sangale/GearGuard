import React from 'react';
import { User, Clock, AlertCircle } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const KanbanCard = ({ id, subject, equipment, technician, date, isOverdue, status, onAssign }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id: id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition
  } : undefined;

  const handlePickUp = (e) => {
    e.stopPropagation();
    // In a real app we'd get the current user. For this demo, let's just pick a random/default tech or prompt.
    // Given the "Manager or technician assigns themselves" rule, we'll just trigger the onAssign callback.
    if (onAssign) onAssign(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 ${isDragging ? 'border-brand-primary opacity-50 z-50 rotate-3' : 'border-brand-border'} rounded-sm p-5 cursor-grab active:cursor-grabbing hover:border-brand-text transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      {...attributes}
      {...listeners}
    >
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <h4 className="text-[11px] font-black text-brand-text uppercase leading-relaxed tracking-wider group-hover:text-brand-primary transition-colors pr-2">
          {subject || "Asset Repair Operation"}
        </h4>
        {isOverdue && (
          <div className="flex-shrink-0 bg-red-500 p-1.5 rounded-sm ring-2 ring-red-100 animate-pulse">
            <Clock size={12} className="text-white" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Equipment Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-wider">{equipment || "Engine Line Asset #001"}</span>
          </div>
          {status === 'new' && !technician && (
            <button
              onClick={handlePickUp}
              className="px-2 py-0.5 border-2 border-brand-text text-[8px] font-black uppercase tracking-widest hover:bg-brand-text hover:text-white transition-all pointer-events-auto"
            >
              Pick Up
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
