import React from 'react';
import Button from './Button';
import Loader from './Loader';
import { ClipboardIcon } from '../constants';

interface RewireMindModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  reframedThought: string | null;
  symptomName: string;
}

const RewireMindModal: React.FC<RewireMindModalProps> = ({ isOpen, onClose, isLoading, reframedThought, symptomName }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    if (reframedThought) {
      navigator.clipboard.writeText(reframedThought)
        .then(() => alert('Statement copied to clipboard!'))
        .catch(() => alert('Failed to copy statement.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700 flex flex-col">
        <header className="p-4 bg-slate-900/50 border-b border-slate-700">
          <h2 className="text-xl font-bold text-[#c9a445] font-brand tracking-wider">Rewire The Mind</h2>
          <p className="text-sm text-slate-400">Reframing: {symptomName}</p>
        </header>
        <div className="p-6 flex-grow min-h-[300px]">
          {isLoading && <Loader text="Analyzing your data to find the core thought..." />}
          {reframedThought && (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Step 1: Identify the Problem in Thought</h3>
                    <p className="text-sm text-slate-400 mb-3">The AI has analyzed your symptom in the context of your timeline to reveal the underlying erroneous perception. This is the "troubled thought" that runs the biological program.</p>
                    <div className="bg-slate-900 p-4 rounded-md">
                        <blockquote className="text-slate-300 font-serif text-lg leading-relaxed border-l-4 border-[#c9a445] pl-4 italic">
                            {reframedThought}
                        </blockquote>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleCopy} className="mt-3">
                        <ClipboardIcon />
                        Copy Statement
                    </Button>
                </div>

                <div className="border-t border-slate-700 pt-4">
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">Step 2: Discuss with your Mentor</h3>
                    <p className="text-sm text-slate-400 mb-3">Now that you have identified the core thought, you can bring this to your mentor. Copy the statement and paste it in the chat with your mentor to explore it further and receive guidance on a new mental framework.</p>
                </div>
            </div>
          )}
        </div>
        <footer className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3">
          <Button onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  );
};

export default RewireMindModal;