import React from 'react';
import Button from './Button';
import { BookOpenIcon } from '../constants';

const PDF_DOWNLOAD_URL = 'https://drive.google.com/uc?export=download&id=18lgNwIpdm21sx0E_V31TjYo6LpVD1YlV';
const BOOK_COVER_IMAGE_URL = 'https://i.imgur.com/JMywiDL.png';

interface BookViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookViewerModal: React.FC<BookViewerModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full h-full max-w-4xl border border-slate-700 flex flex-col">
                <header className="flex-shrink-0 px-4 py-2 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#c9a445] font-brand tracking-wider">The Energy Leak Resources</h2>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </header>
                
                <div className="flex-grow p-6 flex flex-col items-center justify-center overflow-y-auto">
                    <img 
                        src={BOOK_COVER_IMAGE_URL} 
                        alt="The Energy Leak Book Cover"
                        className="w-full max-w-sm rounded-lg shadow-2xl mb-8"
                    />

                    <div className="w-full border-t border-slate-700 my-4 max-w-sm"></div>

                    <h3 className="text-2xl font-semibold text-slate-200 mb-4 text-center">E-Book Download</h3>
                    <a 
                        href={PDF_DOWNLOAD_URL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-block"
                    >
                        <Button size="md" variant="primary">
                            <BookOpenIcon />
                            Download / View 'The Energy Leak' PDF
                        </Button>
                    </a>
                    <p className="text-xs text-slate-500 mt-3 text-center">This will open the book in a new browser tab.</p>
                </div>
            </div>
        </div>
    );
};

export default BookViewerModal;
