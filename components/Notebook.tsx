import React, { useState, useRef } from 'react';
import { AuthUser, SymptomEntry, TimelineData, AiAnalysis } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Button from './Button';
import { PlusIcon, FileTextIcon, ClipboardIcon, DownloadIcon, UploadIcon } from '../constants';
import SymptomFormModal from './SymptomFormModal';
import SymptomEntryCard from './SymptomEntry';
import BioCodeResetModal from './BioCodeResetModal';
import ConfirmationModal from './ConfirmationModal';
import MemoryFinderModal from './MemoryFinderModal';
import RewireMindModal from './RewireMindModal';
import * as geminiService from '../services/geminiService';

interface NotebookProps {
    user: AuthUser;
    setActiveView: (view: 'blueprint' | 'mentor' | 'notebook') => void;
}

const Notebook: React.FC<NotebookProps> = ({ user, setActiveView }) => {
    const userKey = user.username;
    const [symptoms, setSymptoms] = useLocalStorage<SymptomEntry[]>(`gnmNotebookData_${userKey}`, []);
    const [timelineData] = useLocalStorage<TimelineData>(`gnmTimelineData_${userKey}`, { initialAnchor: null, events: [] });
    const [aiAnalysis] = useLocalStorage<AiAnalysis | null>(`gnmAiAnalysis_${userKey}`, null);

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<SymptomEntry | null>(null);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [activeSymptomForReset, setActiveSymptomForReset] = useState<SymptomEntry | null>(null);
    const [generatedScript, setGeneratedScript] = useState<string | null>(null);
    const [isGeneratingScript, setIsGeneratingScript] = useState(false);
    
    const [isRewireModalOpen, setIsRewireModalOpen] = useState(false);
    const [activeSymptomForRewire, setActiveSymptomForRewire] = useState<SymptomEntry | null>(null);
    const [reframedThought, setReframedThought] = useState<string | null>(null);
    const [isLoadingRewire, setIsLoadingRewire] = useState(false);

    const [isPrereqModalOpen, setIsPrereqModalOpen] = useState(false);
    const [isMemoryFinderModalOpen, setIsMemoryFinderModalOpen] = useState(false);
    const [isImportConfirmOpen, setIsImportConfirmOpen] = useState(false);
    const [dataToImport, setDataToImport] = useState<SymptomEntry[] | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [symptomIdToDelete, setSymptomIdToDelete] = useState<string | null>(null);
    
    const importInputRef = useRef<HTMLInputElement>(null);


    const handleOpenFormModal = (entry: SymptomEntry | null = null) => {
        setEntryToEdit(entry);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEntryToEdit(null);
    };

    const handleSubmit = (data: Omit<SymptomEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (entryToEdit) {
            const updatedEntry: SymptomEntry = { 
                ...entryToEdit, 
                ...data, 
                updatedAt: new Date().toISOString() 
            };
            setSymptoms(prev => prev.map(e => (e.id === entryToEdit.id ? updatedEntry : e)));
        } else {
            const newEntry: SymptomEntry = {
                id: new Date().toISOString(),
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setSymptoms(prev => [...prev, newEntry]);
        }
        handleCloseFormModal();
    };

    const handleDelete = (id: string) => {
        setSymptomIdToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (symptomIdToDelete) {
            setSymptoms(prev => prev.filter(e => e.id !== symptomIdToDelete));
        }
        setIsDeleteConfirmOpen(false);
        setSymptomIdToDelete(null);
    };
    
    const handleGenerateScript = async (entry: SymptomEntry) => {
        if (!timelineData.initialAnchor) {
            setIsPrereqModalOpen(true);
            return;
        }
        setActiveSymptomForReset(entry);
        setGeneratedScript(null);
        setIsGeneratingScript(true);
        setIsResetModalOpen(true);
    
        try {
            const script = await geminiService.generateBioCodeResetScript(entry, timelineData, aiAnalysis);
            setGeneratedScript(script);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred while generating the script.";
            alert(message);
            setIsResetModalOpen(false);
        } finally {
            setIsGeneratingScript(false);
        }
    };

    const handleRewireTheMind = async (entry: SymptomEntry) => {
        if (!timelineData.initialAnchor) {
            setIsPrereqModalOpen(true);
            return;
        }
        setActiveSymptomForRewire(entry);
        setReframedThought(null);
        setIsLoadingRewire(true);
        setIsRewireModalOpen(true);

        try {
            const thought = await geminiService.generateThoughtReframing(entry, timelineData, aiAnalysis);
            setReframedThought(thought);
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred while reframing the thought.";
            alert(message);
            setIsRewireModalOpen(false);
        } finally {
            setIsLoadingRewire(false);
        }
    };

    const handleCopyToClipboard = () => {
        if (symptoms.length === 0) {
            alert("Notebook is empty. Nothing to copy.");
            return;
        }

        const formattedText = symptoms.map(entry => {
            return `
----------------------------------------
Symptom: ${entry.name}
Initial Rating: ${entry.initialRating}/10
Current Rating: ${entry.currentRating}/10

Related Tracks:
${entry.relatedTracks || 'N/A'}

Actions Taken:
${entry.actionsTaken || 'N/A'}

Last Updated: ${new Date(entry.updatedAt).toLocaleString()}
----------------------------------------
            `.trim();
        }).join('\n\n');
        
        const fullText = `Symptom Tracker Notebook Backup\nGenerated on: ${new Date().toLocaleString()}\n\n${formattedText}`;

        navigator.clipboard.writeText(fullText)
            .then(() => alert("Notebook data copied to clipboard!"))
            .catch(err => alert("Failed to copy data. See console for details."));
    };

    const handleExport = () => {
        if (symptoms.length === 0) {
            alert("Notebook is empty. Nothing to export.");
            return;
        }
        const dataStr = JSON.stringify(symptoms, null, 2);
        const blob = new Blob([dataStr], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `symptom_notebook_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') throw new Error("Could not read file.");
                const parsedData = JSON.parse(text);

                // Basic validation
                if (Array.isArray(parsedData) && (parsedData.length === 0 || (parsedData[0].id && parsedData[0].name))) {
                    setDataToImport(parsedData);
                    setIsImportConfirmOpen(true);
                } else {
                    throw new Error("Invalid file format.");
                }
            } catch (err) {
                alert("Import failed. Please make sure you are uploading a valid notebook log file (.json).");
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset input to allow re-uploading the same file
    };

    const handleConfirmImport = () => {
        if (dataToImport) {
            setSymptoms(dataToImport);
        }
        setIsImportConfirmOpen(false);
        setDataToImport(null);
    };
    
    const sortedSymptoms = [...symptoms].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return (
        <>
            <div className="container mx-auto p-4 md:p-8">
                <input type="file" accept=".json" ref={importInputRef} className="hidden" onChange={handleImport} />
                <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-slate-700 pb-4">
                    <h1 className="text-3xl font-brand text-[#c9a445] flex items-center gap-3 mb-4 md:mb-0">
                        <FileTextIcon />
                        Symptom Tracker Notebook
                    </h1>
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button variant="secondary" onClick={() => importInputRef.current?.click()}>
                            <UploadIcon />
                            Import Log
                        </Button>
                         <Button variant="secondary" onClick={handleExport}>
                            <DownloadIcon />
                            Export Log
                        </Button>
                        <Button variant="secondary" onClick={handleCopyToClipboard}>
                            <ClipboardIcon />
                            Copy All Data
                        </Button>
                        <Button onClick={() => handleOpenFormModal()}>
                            <PlusIcon />
                            Add Symptom
                        </Button>
                    </div>
                </header>
                
                {sortedSymptoms.length > 0 ? (
                    <div className="space-y-6">
                        {sortedSymptoms.map(entry => (
                            <SymptomEntryCard 
                                key={entry.id} 
                                entry={entry} 
                                onEdit={handleOpenFormModal} 
                                onDelete={handleDelete} 
                                onGenerateScript={handleGenerateScript}
                                onOpenMemoryFinder={() => setIsMemoryFinderModalOpen(true)}
                                onRewireTheMind={handleRewireTheMind}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-slate-400 bg-slate-800/50 rounded-lg">
                        <h2 className="text-2xl font-semibold text-slate-300">Your Notebook is Empty</h2>
                        <p className="mt-2">Click "Add Symptom" to start tracking your healing journey.</p>
                    </div>
                )}
            </div>
            <SymptomFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onSubmit={handleSubmit}
                entryToEdit={entryToEdit}
            />
             <BioCodeResetModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                isLoading={isGeneratingScript}
                scriptText={generatedScript}
                symptomName={activeSymptomForReset?.name || ''}
            />
            <RewireMindModal
                isOpen={isRewireModalOpen}
                onClose={() => setIsRewireModalOpen(false)}
                isLoading={isLoadingRewire}
                reframedThought={reframedThought}
                symptomName={activeSymptomForRewire?.name || ''}
            />
            <ConfirmationModal
                isOpen={isPrereqModalOpen}
                onClose={() => setIsPrereqModalOpen(false)}
                onConfirm={() => {
                    setActiveView('blueprint');
                    setIsPrereqModalOpen(false);
                }}
                title="Action Required"
                confirmText="Go to Blueprint"
                confirmVariant="primary"
            >
                <p>To use this feature, you must first set your timeline anchor in the "Blueprint" tab.</p>
                <p className="mt-2 text-sm text-slate-400">This anchor is the foundation for all AI analysis.</p>
            </ConfirmationModal>
             <ConfirmationModal
                isOpen={isImportConfirmOpen}
                onClose={() => setIsImportConfirmOpen(false)}
                onConfirm={handleConfirmImport}
                title="Confirm Log Import"
                confirmText="Overwrite & Import"
                confirmVariant="primary"
            >
                <p>Are you sure you want to import this log file?</p>
                <p className="mt-2 text-sm text-slate-400">This will overwrite all of the current entries in your notebook.</p>
            </ConfirmationModal>
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => {
                    setIsDeleteConfirmOpen(false);
                    setSymptomIdToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title="Confirm Deletion"
                confirmText="Yes, Delete Entry"
                confirmVariant="danger"
            >
                <p>Are you sure you want to permanently delete this symptom entry? This action cannot be undone.</p>
            </ConfirmationModal>
            <MemoryFinderModal 
                isOpen={isMemoryFinderModalOpen}
                onClose={() => setIsMemoryFinderModalOpen(false)}
            />
        </>
    );
};

export default Notebook;