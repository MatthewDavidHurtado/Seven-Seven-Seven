import React from 'react';
import Button from './Button';

interface MemoryFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIDEO_URL = "https://healvideos.s3.us-east-2.amazonaws.com/Memory+Finder+Meditation-VEED.mp4";

const MemoryFinderModal: React.FC<MemoryFinderModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full h-full max-w-4xl border border-slate-700 flex flex-col">
                <header className="flex-shrink-0 px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#c9a445] font-brand tracking-wider">Memory Finder Meditation</h2>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </header>
                
                <div className="flex-grow p-4 bg-black flex items-center justify-center">
                    <video 
                        src={VIDEO_URL} 
                        controls 
                        className="w-full max-h-full"
                        aria-label="Memory Finder Meditation Video"
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>
    );
};

export default MemoryFinderModal;
