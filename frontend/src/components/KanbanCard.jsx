import React from 'react';
import { User, Clock, AlertCircle, Users, Calendar } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useUser } from '../context/UserContext';

import { formatDistanceToNow } from 'date-fns';

const KanbanCard = ({ id, subject, equipment, technician, teamId, teamName, date, isOverdue, status, workCenter, created_at, picked_up_at, completed_at, follow_up_of, onAssign, onCreateFollowUp, onRoute }) => {
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

  const handleFollowUp = (e) => {
    e.stopPropagation();
    if (onCreateFollowUp) onCreateFollowUp({ id, subject, equipment, teamId });
  };

  // Permission Logic: Only Super Admin or Team Lead of THIS squad can assign
  const canAssign = user.role === 'SUPER_ADMIN' || (user.role === 'TEAM_LEAD' && user.team_id === teamId);
  const canFollowUp = (user.role === 'SUPER_ADMIN' || user.role === 'TEAM_LEAD') && (status === 'repaired' || status === 'scrap');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 ${isDragging ? 'border-brand-primary opacity-50 z-50 rotate-3' : isOverdue ? 'border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]' : 'border-brand-border'} rounded-sm p-4 cursor-grab active:cursor-grabbing hover:border-brand-text transition-all group shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative`}
      {...attributes}
      {...listeners}
    >
      {/* Follow-up Link Badge */}
      {follow_up_of && (
        <div className="absolute -top-2.5 right-4 bg-purple-100 text-purple-700 text-[8px] font-black px-1.5 py-0.5 rounded-sm border border-purple-200">
          LINKED TO REQ #{follow_up_of}
        </div>
      )}

      {/* Top Section */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-col">
          <span className="text-[8px] text-gray-400 font-extrabold tracking-widest uppercase">REQ #{id}</span>
          <h4 className={`text-[11px] font-black uppercase leading-relaxed tracking-wider group-hover:text-brand-primary transition-colors pr-2 ${isOverdue ? 'text-red-600' : 'text-brand-text'}`}>
            {subject || "Asset Repair Operation"}
          </h4>
        </div>
        {isOverdue && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <div className="flex-shrink-0 bg-red-500 p-1.5 rounded-sm ring-2 ring-red-100 animate-pulse">
              <Clock size={12} className="text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Squad Badge */}
      <div className="mb-3 flex items-center gap-1.5">
        <span className="bg-gray-100 text-gray-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-gray-200">
          {teamName || "General"} SQUAD
        </span>
        {!technician ? (
          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest ring-1 ring-red-100 px-1.5 py-0.5 rounded-sm bg-red-50/50">Unassigned</span>
        ) : (
          <span className="text-[8px] font-black text-green-600 uppercase tracking-widest ring-1 ring-green-100 px-1.5 py-0.5 rounded-sm bg-green-50/50">Assigned</span>
        )}
      </div>

      <div className="space-y-3">
        {/* Equipment Label */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brand-primary rounded-full" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-wider">{equipment || "Engine Line Asset #001"}</span>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-1">
            {/* Assignment Control */}
            {!technician && canAssign && (
              <button
                onClick={handlePickUp}
                className="px-2 py-0.5 border-2 border-brand-text text-[8px] font-black uppercase tracking-widest hover:bg-brand-text hover:text-white transition-all pointer-events-auto shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-0.5"
              >
                Assign
              </button>
            )}
            {/* Follow Up Control */}
            {canFollowUp && (
              <button
                onClick={handleFollowUp}
                className="px-2 py-0.5 border-2 border-purple-600 text-purple-700 bg-purple-50 text-[8px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all pointer-events-auto shadow-[2px_2px_0px_0px_rgba(147,51,234,0.3)]"
              >
                Follow Up
              </button>
            )}
            {/* Triage Route Control */}
            {onRoute && (
              <button
                onClick={(e) => { e.stopPropagation(); onRoute(id); }}
                className="px-2 py-0.5 border-2 border-orange-500 text-orange-600 bg-orange-50 text-[8px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all pointer-events-auto shadow-[2px_2px_0px_0px_rgba(249,115,22,0.3)]"
              >
                Route Request
              </button>
            )}
          </div>
        </div>

        {/* Work Center Context Badge */}
        {workCenter && (
          <div className="flex items-center gap-1 pl-3.5">
            <span className="text-[7px] font-black text-brand-muted/70 uppercase tracking-widest border border-brand-border px-1 rounded-sm">
              WC: {workCenter}
            </span>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-bg">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 ${technician ? 'bg-brand-text text-white' : 'bg-gray-100 text-gray-400'} rounded-sm border-2 ${technician ? 'border-brand-text' : 'border-gray-200'} flex items-center justify-center text-[8px] font-black uppercase`}>
              {technician ? technician.split(' ').map(n => n[0]).join('') : '?'}
            </div>
            <span className="text-[9px] font-black text-brand-muted uppercase tracking-tight">{technician || "Unassigned"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-brand-muted">
            <Calendar size={10} />
            <span className="text-[9px] font-black uppercase tracking-tight">{date || "DEC 27"}</span>
            {isOverdue && status !== 'repaired' && (
              <span className="text-red-500 font-bold ml-1">OVERDUE</span>
            )}
          </div>
        </div>



        {/* Audit Traceability - Enhanced Layout */}
        <div className="mt-2 bg-gray-50 p-2 rounded-sm border border-gray-100 flex flex-col gap-1">
          <div className="flex justify-between text-[7px] text-gray-400 uppercase tracking-widest border-b border-gray-200 pb-1 mb-1">
            <span>AUDIT RECORD</span>
          </div>
          {created_at && (
            <div className="flex flex-col text-[8px] text-gray-500 mb-1">
              <span className="flex justify-between">
                <span>Created</span>
                <span className="font-mono">{formatDistanceToNow(new Date(created_at), { addSuffix: true })}</span>
              </span>
              <span className="text-[7px] text-gray-300 font-mono text-right">{new Date(created_at).toLocaleString()}</span>
            </div>
          )}
          {picked_up_at && (
            <div className="flex flex-col text-[8px] text-blue-600 mb-1">
              <span className="flex justify-between items-center">
                <span className="font-bold">Picked Up</span>
                <span className="font-mono">{formatDistanceToNow(new Date(picked_up_at), { addSuffix: true })}</span>
              </span>
              <span className="text-[7px] text-blue-300 font-mono text-right">{new Date(picked_up_at).toLocaleString()}</span>
            </div>
          )}
          {completed_at && (
            <div className="flex flex-col text-[8px] text-green-600">
              <span className="flex justify-between items-center">
                <span className="font-black">COMPLETED</span>
                <span className="font-mono">{formatDistanceToNow(new Date(completed_at), { addSuffix: true })}</span>
              </span>
              <span className="text-[7px] text-green-300 font-mono text-right">{new Date(completed_at).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
