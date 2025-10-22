import React from 'react';
import Button from './Button';
import { PluginIcon } from '../constants';

interface PluginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Corrected list of plugins based on user feedback.
const PLUGINS = [
  {
    title: 'I AM OK: No More CFS!',
    url: 'https://www.iamok.life',
    description: 'Access the full course for overcoming Chronic Fatigue Syndrome.',
    isPassword: false
  },
  {
    title: "How to Hear God's Voice",
    url: 'https://copy-of-how-to-hear-god-s-voice-759385455270.us-west1.run.app/',
    description: 'A course on developing your spiritual senses and intuition.',
    isPassword: false
  },
  {
    title: 'Quantum Gnosis Course (SSWOS)',
    url: 'https://www.kingley.org',
    description: 'Pass: MK_Gnostic_Keeper777!',
    isPassword: true
  },
   {
    title: "Malcolm Kingley's Website",
    url: 'https://www.malcolmkingley.com',
    description: 'Pass: GIVE_777!',
    isPassword: true
  },
];


const PluginModal: React.FC<PluginModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full h-full max-w-4xl border border-slate-700 flex flex-col">
                <header className="flex-shrink-0 px-4 py-3 bg-slate-900/50 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#c9a445] font-brand tracking-wider">Plugins & Resources</h2>
                    <Button variant="secondary" onClick={onClose}>Close</Button>
                </header>
                
                <div className="flex-grow p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PLUGINS.map((plugin) => (
                            <a 
                                key={plugin.title}
                                href={plugin.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-slate-900/50 hover:bg-slate-700 rounded-lg border border-slate-700 transition-all duration-200 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-[#c9a445]"><PluginIcon /></div>
                                    <h3 className="text-md font-semibold text-slate-200 group-hover:text-white">{plugin.title}</h3>
                                </div>
                                <p className={`text-sm mt-2 pl-9 ${plugin.isPassword ? 'text-green-300 font-mono bg-green-900/30 px-2 py-1 rounded-md inline-block' : 'text-slate-400'}`}>{plugin.description}</p>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PluginModal;