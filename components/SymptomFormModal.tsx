import React, { useState, useEffect, useRef } from 'react';
import { SymptomEntry } from '../types';
import Button from './Button';
import { MicrophoneIcon } from '../constants';

// Add SpeechRecognition types for browsers that support it under a webkit prefix
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  abort: () => void;
}
// Fix: Augment the window object to include SpeechRecognition APIs for proper TypeScript type checking.
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition; };
    webkitSpeechRecognition: { new(): SpeechRecognition; };
  }
}

type VoiceEnabledField = 'name' | 'relatedTracks' | 'actionsTaken';

interface SymptomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SymptomEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  entryToEdit: SymptomEntry | null;
}

const SymptomFormModal: React.FC<SymptomFormModalProps> = ({ isOpen, onClose, onSubmit, entryToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    initialRating: 5,
    currentRating: 5,
    relatedTracks: '',
    actionsTaken: '',
  });

  const [listeningField, setListeningField] = useState<VoiceEnabledField | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const handleListen = (field: VoiceEnabledField) => {
    // If we are currently listening, stop the recognition. `onend` will handle cleanup.
    if (recognitionRef.current) {
        recognitionRef.current.stop();
        return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
        alert("Speech Recognition API is not supported in this browser.");
        return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        setListeningField(field);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      setFormData(prev => ({ ...prev, [field]: (prev[field] ? prev[field] + ' ' : '') + transcript }));
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
       if (event.error !== 'no-speech') {
        alert(`Speech recognition error: ${event.error}. Please ensure microphone access has been granted.`);
      }
    };

    recognition.onend = () => {
      setListeningField(null);
      recognitionRef.current = null;
    };
    
    try {
        recognition.start();
    } catch(e) {
        console.error("Error starting speech recognition:", e);
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
        setListeningField(null);
        recognitionRef.current = null;
    }
  };

  useEffect(() => {
    if (entryToEdit) {
      setFormData({
        name: entryToEdit.name,
        initialRating: entryToEdit.initialRating,
        currentRating: entryToEdit.currentRating,
        relatedTracks: entryToEdit.relatedTracks,
        actionsTaken: entryToEdit.actionsTaken,
      });
    } else {
      setFormData({
        name: '',
        initialRating: 5,
        currentRating: 5,
        relatedTracks: '',
        actionsTaken: '',
      });
    }
  }, [entryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? parseInt(value, 10) : value 
    }));
  };
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  const renderInputWithMic = (
    id: VoiceEnabledField,
    label: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    isTextarea = false,
    placeholder = "",
    rows = 4
  ) => (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
      {isTextarea ? (
        <textarea
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
        />
      ) : (
        <input
          type="text"
          name={id}
          id={id}
          value={value}
          onChange={onChange}
          required
          placeholder={placeholder}
          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
        />
      )}
      {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
        <button type="button" onClick={() => handleListen(id)} className={`absolute right-2 top-9 p-1 rounded-full transition-colors ${listeningField === id ? 'text-red-500 bg-red-900/50' : 'text-slate-400 hover:text-white'}`}>
          <MicrophoneIcon />
        </button>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#c9a445] mb-4 font-brand tracking-wider">{entryToEdit ? 'Edit' : 'Track a New'} Symptom</h2>
            <div className="space-y-4">
              {renderInputWithMic('name', 'Symptom Name', formData.name, handleChange, false, "e.g., Chronic Fatigue, Lower Back Pain")}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                    <label htmlFor="initialRating" className="block text-sm font-medium text-slate-300 mb-1">Initial Severity: <span className="font-bold text-white">{formData.initialRating}/10</span></label>
                    <input type="range" name="initialRating" id="initialRating" min="0" max="10" value={formData.initialRating} onChange={handleRangeChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
                <div>
                    <label htmlFor="currentRating" className="block text-sm font-medium text-slate-300 mb-1">Current Severity: <span className="font-bold text-white">{formData.currentRating}/10</span></label>
                    <input type="range" name="currentRating" id="currentRating" min="0" max="10" value={formData.currentRating} onChange={handleRangeChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb" />
                </div>
              </div>
              {renderInputWithMic('relatedTracks', 'Memory-Track(s) Discovered', formData.relatedTracks, handleChange, true, "Describe any memories, feelings, or situations that seem to trigger or relate to this symptom.")}
              {renderInputWithMic('actionsTaken', 'Actions Taken for Resolution', formData.actionsTaken, handleChange, true, "List any steps you've taken to resolve this, e.g., applied a BIO-CODE RESET, changed a behavior, used a Rewire The Mind script.")}
            </div>
          </div>
          <div className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{entryToEdit ? 'Save Changes' : 'Add to Notebook'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomFormModal;