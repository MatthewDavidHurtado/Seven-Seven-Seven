import React, { useState, useRef } from 'react';
import { InitialAnchor } from '../types';
import Button from './Button';
import { CameraIcon, MicrophoneIcon } from '../constants';

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

// Fix: Add missing props interface definition.
interface InitialAnchorFormProps {
  onSubmit: (anchor: InitialAnchor) => void;
  onScan: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const InitialAnchorForm: React.FC<InitialAnchorFormProps> = ({ onSubmit, onScan }) => {
  const [age, setAge] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('Became independent from parents.');
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [listeningField, setListeningField] = useState<keyof Omit<InitialAnchor, 'age'> | 'age_string' | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);


  const handleListen = (field: keyof Omit<InitialAnchor, 'age'> | 'age_string') => {
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
      if (field === 'age_string') setAge(prev => (prev ? prev + ' ' : '') + transcript);
      if (field === 'date') setDate(prev => (prev ? prev + ' ' : '') + transcript);
      if (field === 'description') setDescription(prev => (prev ? prev + ' ' : '') + transcript);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (age && date && description) {
      onSubmit({
        age: parseInt(age, 10),
        date,
        description,
      });
    }
  };

  const renderInputWithMic = (
    id: keyof Omit<InitialAnchor, 'age'> | 'age_string', 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    isTextarea = false,
    placeholder = ""
    ) => (
    <div className="relative">
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1 text-left">{label}</label>
      {isTextarea ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          rows={2}
          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
        />
      ) : (
        <input
          type={id === 'age_string' ? "number" : "text"}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 pr-10 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
          placeholder={placeholder}
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
    <div className="w-full max-w-lg mx-auto p-8 bg-slate-800 rounded-lg shadow-2xl border border-slate-700 text-center">
      <h2 className="text-2xl font-bold text-[#c9a445] font-brand tracking-wider mb-2">Set Your Timeline Anchor</h2>
      <p className="text-slate-400 mb-6">This is the age you became independent. It's the foundation of your biological cycles.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderInputWithMic('age_string', 'Age of Independence', age, setAge, false, "e.g., 18")}
        {renderInputWithMic('date', 'Approximate Year', date, setDate, false, "e.g., 2005")}
        {renderInputWithMic('description', 'Description', description, setDescription, true)}
        
        <div className="pt-2">
            <Button type="submit" className="w-full">Set Anchor & Begin</Button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-slate-800 px-2 text-sm text-slate-400">Or</span>
        </div>
      </div>

       <div>
         <input type="file" accept="image/*,application/pdf" ref={scanInputRef} className="hidden" onChange={onScan} multiple />
          <Button variant="secondary" onClick={() => scanInputRef.current?.click()} className="w-full">
            <CameraIcon />
            Scan Handwritten Timeline
          </Button>
          <p className="text-xs text-slate-500 mt-2">Upload a photo or PDF of your timeline to have the AI populate it for you.</p>
       </div>

    </div>
  );
};

export default InitialAnchorForm;