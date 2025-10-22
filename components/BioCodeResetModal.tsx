import React from 'react';
import Button from './Button';
import Loader from './Loader';
import { ClipboardIcon } from '../constants';

interface BioCodeResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  scriptText: string | null;
  symptomName: string;
}

const BioCodeResetModal: React.FC<BioCodeResetModalProps> = ({ isOpen, onClose, isLoading, scriptText, symptomName }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    if (scriptText) {
      navigator.clipboard.writeText(scriptText)
        .then(() => alert('Script copied to clipboard!'))
        .catch(() => alert('Failed to copy script.'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700 flex flex-col">
        <header className="p-4 bg-slate-900/50 border-b border-slate-700">
          <h2 className="text-xl font-bold text-[#c9a445] font-brand tracking-wider">BIO-CODE RESET Script</h2>
          <p className="text-sm text-slate-400">For: {symptomName}</p>
        </header>
        <div className="p-6 flex-grow min-h-[200px]">
          {isLoading && <Loader text="Crafting your personalized reset script..." />}
          {scriptText && (
            <div className="bg-slate-900 p-4 rounded-md">
              <p className="text-slate-300 whitespace-pre-wrap font-serif text-lg leading-relaxed">{scriptText}</p>
            </div>
          )}
        </div>
        <footer className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3">
          {scriptText && !isLoading && <Button variant="secondary" onClick={handleCopy}><ClipboardIcon /> Copy Script</Button>}
          <Button onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  );
};

export default BioCodeResetModal;
