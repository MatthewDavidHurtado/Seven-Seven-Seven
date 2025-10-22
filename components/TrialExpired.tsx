import React from 'react';
import Button from './Button';

interface TrialExpiredProps {
    onLogout: () => void;
}

const TrialExpired: React.FC<TrialExpiredProps> = ({ onLogout }) => {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a192f] justify-center items-center p-4 text-center">
            <div className="w-full max-w-lg mx-auto p-8 bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
                <img src="https://i.imgur.com/1XKnKzI.png" alt="Biological Code Logo" className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-[#c9a445] tracking-wider font-brand">90-Day Access Period Expired</h1>
                <p className="text-slate-300 mt-4">
                    Thank you for using the Biological Code Discovery & Mentorship platform. Your 90-day introductory access has concluded.
                </p>
                <p className="text-slate-400 mt-4">
                    To continue your journey of healing and self-discovery, please visit our website to learn more about our programs and full access options.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <a href="https://www.kingley.org" target="_blank" rel="noopener noreferrer">
                        <Button variant="primary">
                            Explore Full Access
                        </Button>
                    </a>
                    <Button variant="secondary" onClick={onLogout}>
                        Log Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TrialExpired;
