import React from 'react';
import { TimeRemaining } from '../hooks/useTrial';

interface TrialCountdownProps {
    timeRemaining: TimeRemaining | null;
}

const TimePart: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex items-baseline gap-1">
        <span className="font-mono text-lg font-bold">{String(value).padStart(2, '0')}</span>
        <span className="text-xs font-semibold uppercase">{label}</span>
    </div>
);

const TrialCountdown: React.FC<TrialCountdownProps> = ({ timeRemaining }) => {
    if (!timeRemaining) {
        return null;
    }

    const { days, hours, minutes, seconds } = timeRemaining;
    const isEndingSoon = days < 1;
    const textColor = isEndingSoon ? 'text-red-400' : 'text-[#c9a445]';

    return (
        <div className={`px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-md ${textColor} transition-colors`}>
            <div className="text-center text-xs font-semibold text-slate-300 mb-1">Access Ends In:</div>
            <div className="flex justify-center items-baseline gap-2">
                <TimePart value={days} label="d" />
                <span className="text-slate-600 -mx-1">:</span>
                <TimePart value={hours} label="h" />
                <span className="text-slate-600 -mx-1">:</span>
                <TimePart value={minutes} label="m" />
                <span className="text-slate-600 -mx-1">:</span>
                <TimePart value={seconds} label="s" />
            </div>
        </div>
    );
};

export default TrialCountdown;