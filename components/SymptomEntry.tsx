import React from 'react';
import { SymptomEntry } from '../types';
import { EditIcon, TrashIcon, SparklesIcon, SearchIcon, BrainCircuitIcon } from '../constants';
import Button from './Button';

interface SymptomEntryProps {
  entry: SymptomEntry;
  onEdit: (entry: SymptomEntry) => void;
  onDelete: (id: string) => void;
  onGenerateScript: (entry: SymptomEntry) => void;
  onOpenMemoryFinder: () => void;
  onRewireTheMind: (entry: SymptomEntry) => void;
}

const RatingBar: React.FC<{ label: string; rating: number }> = ({ label, rating }) => {
  // Sanitize the rating to prevent crashes or visual bugs from corrupted data (e.g., NaN).
  const safeRating = (typeof rating === 'number' && isFinite(rating)) ? Math.max(0, Math.min(10, rating)) : 0;
  const percentage = safeRating * 10;
  
  // Colors from red to yellow to green
  const colorStops = ['#ef4444', '#f87171', '#fb923c', '#fbbd23', '#facc15', '#a3e635', '#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'];
  const barColor = colorStops[safeRating] || '#ef4444';
  
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-lg font-bold text-white">{safeRating}<span className="text-sm text-slate-400">/10</span></span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: barColor }}></div>
      </div>
    </div>
  );
};

const SymptomEntryCard: React.FC<SymptomEntryProps> = ({ entry, onEdit, onDelete, onGenerateScript, onOpenMemoryFinder, onRewireTheMind }) => {
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(entry.updatedAt);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
      });
    } catch (e) {
      console.warn(`Could not format date: ${entry.updatedAt}`);
      return "Invalid date";
    }
  }, [entry.updatedAt]);

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      <header className="bg-slate-900/50 p-4 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
            <h3 className="text-xl font-bold text-[#c9a445] font-brand tracking-wide">{entry.name}</h3>
            <p className="text-xs text-slate-500">Last updated: {formattedDate}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 lg:flex-row lg:flex-wrap lg:items-center lg:justify-end w-full lg:w-auto lg:flex-shrink-0">
            <button
                type="button"
                onClick={onOpenMemoryFinder}
                className="inline-flex items-center justify-center gap-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a192f] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
            >
                <SearchIcon />
                Memory Finder
            </button>
            <button
                type="button"
                onClick={() => onGenerateScript(entry)}
                className="inline-flex items-center justify-center gap-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a192f] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs bg-[#c9a445] text-slate-900 hover:bg-[#b8943c] focus:ring-[#c9a445]"
            >
                <SparklesIcon />
                BIO-CODE RESET
            </button>
            <button
                type="button"
                onClick={() => onRewireTheMind(entry)}
                className="inline-flex items-center justify-center gap-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a192f] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 text-xs bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
            >
                <BrainCircuitIcon />
                Rewire The Mind
            </button>
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-700 lg:border-0 lg:pt-0 lg:ml-2">
                <button onClick={() => onEdit(entry)} className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700" title="Edit Entry"><EditIcon /></button>
                <button onClick={() => onDelete(entry.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-700" title="Delete Entry"><TrashIcon /></button>
            </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RatingBar label="Initial Severity" rating={entry.initialRating} />
          <RatingBar label="Current Severity" rating={entry.currentRating} />
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-300 mb-1">Memory-Track(s) Discovered</h4>
          <p className="text-sm text-slate-400 bg-slate-900/70 p-3 rounded-md whitespace-pre-wrap">{entry.relatedTracks || 'No tracks noted.'}</p>
        </div>
        
        <div>
          <h4 className="font-semibold text-slate-300 mb-1">Actions Taken for Resolution</h4>
          <p className="text-sm text-slate-400 bg-slate-900/70 p-3 rounded-md whitespace-pre-wrap">{entry.actionsTaken || 'No actions noted.'}</p>
        </div>
      </div>
    </div>
  );
};

export default SymptomEntryCard;