import React, { useState } from 'react';
import Button from './Button';
import { BrainCircuitIcon } from '../constants';

interface AccessGateProps {
  onAccessGranted: () => void;
}

// This is a simple, client-side-only access code.
// A determined user could find this in the source, but it serves as an effective gate for non-technical users.
const CORRECT_ACCESS_CODE = "MK777";

const AccessGate: React.FC<AccessGateProps> = ({ onAccessGranted }) => {
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessCode === CORRECT_ACCESS_CODE) {
            onAccessGranted();
        } else {
            setError('Invalid Access Code. Please contact the administrator.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0a192f] justify-center items-center p-4">
            <div className="w-full max-w-sm mx-auto p-8 bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
                <div className="text-center mb-8">
                    <img src="https://i.imgur.com/1XKnKzI.png" alt="Biological Code Logo" className="w-12 h-12 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-[#c9a445] tracking-wider font-brand">Private Access</h1>
                    <p className="text-slate-400 mt-2">Please enter the access code to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="accessCode" className="sr-only">Access Code</label>
                        <input
                            id="accessCode"
                            type="password"
                            value={accessCode}
                            onChange={(e) => {
                                setAccessCode(e.target.value);
                                setError('');
                            }}
                            required
                            placeholder="Enter Access Code"
                            className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-center text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div className="pt-2">
                        <Button type="submit" className="w-full">
                            Enter
                        </Button>
                    </div>
                </form>
            </div>
            <div className="mt-8 text-center max-w-sm w-full">
                 <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400 text-sm">
                        This app is optimized for Brave and Chrome. For the best experience, please use one of these browsers.
                        <br/>
                        <a href="https://brave.com/download/" target="_blank" rel="noopener noreferrer" className="text-[#c9a445] hover:underline font-semibold">
                            Get Brave
                        </a>
                        <span className="mx-2 text-slate-500">|</span>
                        <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer" className="text-[#c9a445] hover:underline font-semibold">
                            Get Chrome
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccessGate;