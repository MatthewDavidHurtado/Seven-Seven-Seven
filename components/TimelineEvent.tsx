import React, { useState } from 'react';
import { ConflictEvent, Track } from '../types';
import { EditIcon, TrashIcon, ChevronDownIcon } from '../constants';

interface TimelineEventProps {
  event: ConflictEvent;
  onEdit: (event: ConflictEvent) => void;
  onDelete: (id: string) => void;
  isLeft: boolean;
  track?: Track;
  cycleLength: number;
}

const TimelineEvent: React.FC<TimelineEventProps> = ({ event, onEdit, onDelete, isLeft, track, cycleLength }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const trackColor = track ? 'border-amber-400' : 'border-[#c9a445]';
  
  const containerClasses = `mb-8 flex justify-between items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`;
  const cardBorderStyle = isLeft ? `md:border-r-4 ${trackColor}` : `md:border-l-4 ${trackColor} border-l-4`;

  const cycleAge = cycleLength > 0 ? (event.age - 1) % cycleLength + 1 : event.age;

  return (
    <div className={containerClasses}>
      <div className="hidden md:block w-5/12"></div>
      
      <div className={`z-10 flex items-center order-1 bg-slate-800 shadow-xl w-8 h-8 rounded-full border-2 ${trackColor}`}>
        <h1 className="mx-auto font-semibold text-sm text-white">{event.age}</h1>
      </div>

      <div className={`order-1 bg-slate-800 rounded-lg shadow-xl w-full md:w-5/12 px-6 py-4 ${cardBorderStyle}`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-bold text-[#c9a445]">{event.conflictType || 'Uncategorized Conflict'}</p>
                <time className="text-xs text-slate-400">{event.date}</time>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => onEdit(event)} className="text-slate-400 hover:text-white"><EditIcon /></button>
                <button onClick={() => onDelete(event.id)} className="text-slate-400 hover:text-red-500"><TrashIcon /></button>
            </div>
        </div>
        
        <p className="text-sm leading-snug tracking-wide text-slate-300 mt-2">{event.description}</p>
        <p className="text-xs text-[#c9a445] mt-1 font-semibold">Cycle Age: {cycleAge}</p>
        
        {track && <div className="mt-2 text-xs font-semibold text-amber-300 bg-amber-900/50 inline-block px-2 py-1 rounded">Track: {track.theme}</div>}

        <button onClick={() => setIsExpanded(!isExpanded)} className="w-full mt-3 text-sm text-[#c9a445] hover:text-[#e7c87c] flex items-center justify-between">
            <span>AI Explanation</span>
            <span className={isExpanded ? 'rotate-180' : ''}><ChevronDownIcon /></span>
        </button>
        
        {isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-700 text-sm text-slate-400 space-y-3">
                {event.gnmExplanation ? (
                    <>
                        <div>
                            <h4 className="font-semibold text-slate-300">Biological Program:</h4>
                            <p>{event.gnmExplanation}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-300">Germ Layer:</h4>
                            <p>{event.germLayer}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-300">Expected Healing Symptoms:</h4>
                            <p>{event.healingSymptoms}</p>
                        </div>
                    </>
                ) : <p>No AI analysis available for this event.</p>}
            </div>
        )}
      </div>
    </div>
  );
};

export default TimelineEvent;