import React from 'react';
import { BrainCircuitIcon } from '../constants';

interface SystemMessageProps {
  children: React.ReactNode;
}

const SystemMessage: React.FC<SystemMessageProps> = ({ children }) => {
  return (
    <div className="my-4 text-center">
        <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2">
            <div className="text-amber-400">
                <BrainCircuitIcon />
            </div>
            <p className="text-xs text-slate-400 italic">
                {children}
            </p>
        </div>
    </div>
  );
};

export default SystemMessage;
