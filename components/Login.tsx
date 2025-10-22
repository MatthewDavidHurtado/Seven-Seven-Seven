import React, { useState } from 'react';
import Button from './Button';
import { BrainCircuitIcon, LogInIcon } from '../constants';

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    // --- STATE MANAGEMENT ---
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reminder, setReminder] = useState(''); // For new accounts
    const [error, setError] = useState(''); // For login view
    const [view, setView] = useState<'login' | 'forgot'>('login');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotMessageType, setForgotMessageType] = useState<'error' | 'success' | null>(null);

    // --- HANDLERS ---
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError("Username and password fields cannot be empty.");
            return;
        }

        const usersJSON = window.localStorage.getItem('gnmUsers');
        const users = usersJSON ? JSON.parse(usersJSON) : {};
        
        const userData = users[username];

        if (userData) {
            // User record exists. Could be active or deleted.
            if (userData.status === 'deleted') {
                // --- This is a RE-REGISTRATION ---
                if (password === 'private_access') {
                    setError("This password is reserved for system use and cannot be used for a new account.");
                    return;
                }
                if (!reminder.trim()) {
                    setError("Please provide a password reminder to re-activate your account.");
                    return;
                }
                // Re-activate the account with new credentials but the ORIGINAL trial start date.
                users[username] = {
                    password,
                    reminder,
                    trialStartDate: userData.trialStartDate, // Preserve the original date
                };
                window.localStorage.setItem('gnmUsers', JSON.stringify(users));
                onLogin(username);

            } else {
                // --- This is a LOGIN ATTEMPT for an active account ---
                if (!userData.trialStartDate) { // Backward compatibility
                    userData.trialStartDate = new Date().toISOString();
                    window.localStorage.setItem('gnmUsers', JSON.stringify(users));
                }
                if (password === 'private_access' || userData.password === password) {
                    onLogin(username);
                } else {
                    setError(`Incorrect password. Your hint: "${userData.reminder || 'No hint provided.'}"`);
                }
            }
        } else {
            // --- This is a NEW REGISTRATION ---
            if (password === 'private_access') {
                setError("This password is reserved for system use and cannot be used for a new account.");
                return;
            }
            if (!reminder.trim()) {
                setError("For a new account, please also provide a password reminder.");
                return;
            }
            users[username] = { 
                password, 
                reminder,
                trialStartDate: new Date().toISOString()
            };
            window.localStorage.setItem('gnmUsers', JSON.stringify(users));
            onLogin(username);
        }
    };

    const handleShowReminder = (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage('');
        setForgotMessageType(null);

        if (!username.trim()) {
            setForgotMessage("Please enter your username.");
            setForgotMessageType('error');
            return;
        }

        const usersJSON = window.localStorage.getItem('gnmUsers');
        const users = usersJSON ? JSON.parse(usersJSON) : {};
        const userData = users[username];

        if (userData && userData.status !== 'deleted') {
            setForgotMessage(`Hint: "${userData.reminder || 'No reminder was set for this account.'}"`);
            setForgotMessageType('success');
        } else {
            setForgotMessage('Username not found or account is inactive.');
            setForgotMessageType('error');
        }
    };
    
    // --- VIEW TRANSITION HANDLERS ---
    const switchToLogin = () => {
        setView('login');
        setPassword('');
        setReminder('');
        setError('');
        setForgotMessage('');
        setForgotMessageType(null);
    };

    const switchToForgot = () => {
        setView('forgot');
        setPassword('');
        setReminder('');
        setError('');
        setForgotMessage('');
        setForgotMessageType(null);
    }

    // --- RENDER LOGIC ---
    const renderLoginView = () => (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                    id="username" type="text" autoComplete="username"
                    value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input
                    id="password" type="password" autoComplete="current-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
                />
            </div>
            <div>
                <label htmlFor="reminder" className="block text-sm font-medium text-slate-300 mb-1">Password Reminder (for new accounts)</label>
                <input
                    id="reminder" type="text" placeholder="e.g., Favorite song? Required for new account."
                    value={reminder} onChange={(e) => setReminder(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
                />
            </div>
            {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded-md">{error}</p>}
            <div className="pt-2">
                <Button type="submit" className="w-full">
                    <LogInIcon />
                    Login / Create Account
                </Button>
            </div>
             <div className="text-center">
                <button type="button" onClick={switchToForgot} className="text-sm text-slate-400 hover:text-[#c9a445] transition-colors">
                    Forgot Password?
                </button>
            </div>
        </form>
    );

    const renderForgotView = () => (
        <form onSubmit={handleShowReminder} className="space-y-4">
            <p className="text-sm text-slate-400 text-center">Enter your username to see your password reminder.</p>
            <div>
                <label htmlFor="username-forgot" className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input
                    id="username-forgot" type="text" autoComplete="username"
                    value={username} onChange={(e) => setUsername(e.target.value)} required
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
                />
            </div>
            {forgotMessage && (
                 <p className={`text-sm text-center p-2 rounded-md ${forgotMessageType === 'error' ? 'text-red-400 bg-red-900/50' : 'text-green-300 bg-green-900/50'}`}>
                    {forgotMessage}
                 </p>
            )}
            <div className="pt-2">
                <Button type="submit" className="w-full">Show Reminder</Button>
            </div>
        </form>
    );

    return (
        <div className="min-h-screen bg-[#0a192f] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto bg-slate-800 rounded-lg shadow-2xl border border-slate-700 overflow-hidden md:flex">
                <div className="md:w-1/2 flex items-center justify-center p-8 md:p-0">
                    <img
                        src="https://i.imgur.com/4xHwLuT.jpeg"
                        alt="A serene person meditating outdoors with a futuristic overlay."
                        className="w-64 h-64 rounded-full object-cover object-center md:w-full md:h-full md:rounded-none"
                    />
                </div>
                <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <div className="text-center mb-8">
                        <img src="https://i.imgur.com/1XKnKzI.png" alt="Biological Code Logo" className="w-12 h-12 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-[#c9a44f] tracking-wider font-brand leading-tight">BIOLOGICAL CODE</h1>
                        <p className="text-md text-slate-300 tracking-wide font-brand leading-tight">
                            {view === 'login' ? 'DISCOVERY & MENTORSHIP' : 'PASSWORD REMINDER'}
                        </p>
                    </div>

                    {view === 'login' ? renderLoginView() : renderForgotView()}
                    
                    {view === 'forgot' && (
                        <div className="text-center mt-4">
                            <button type="button" onClick={switchToLogin} className="text-sm text-slate-400 hover:text-[#c9a445] transition-colors">
                                Back to Login
                            </button>
                        </div>
                    )}

                    {view === 'login' && (
                        <p className="text-center text-xs text-slate-500 mt-6">
                            If username exists, this will log you in. If not, it will create a new local account. All data is stored securely on your device.
                        </p>
                    )}
                </div>
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

export default Login;