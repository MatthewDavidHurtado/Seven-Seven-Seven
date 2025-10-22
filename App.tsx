import React, { useState, useCallback, useEffect } from 'react';
import useAuth from './hooks/useAuth';
import Login from './components/Login';
import Blueprint from './components/Blueprint';
import Mentor from './components/Mentor';
import Notebook from './components/Notebook';
import Navigation from './components/Navigation';
import AccessGate from './components/AccessGate';
import useLocalStorage from './hooks/useLocalStorage';
import SettingsModal from './components/SettingsModal';
import BookViewerModal from './components/BookViewerModal';
import { MentorConfig, ReportData, SelfAwarenessProtocol } from './types';
import DisclaimerModal from './components/DisclaimerModal';
import PluginModal from './components/PluginModal';
import SelfAwareness from './components/SelfAwareness';
import { useTrial } from './hooks/useTrial';
import TrialExpired from './components/TrialExpired';
import Footer from './components/Footer';
import Button from './components/Button';
import { ShareIosIcon } from './constants';

type ActiveView = 'blueprint' | 'mentor' | 'notebook' | 'self-awareness';

function App() {
    const { isAuthenticated, user, login, logout, deleteUserAccount } = useAuth();
    const { isTrialActive, timeRemaining } = useTrial(user);
    const [activeView, setActiveView] = useState<ActiveView>('blueprint');
    const [isAccessGranted, setIsAccessGranted] = useLocalStorage('gnmAccessGranted', false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);
    const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
    
    const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useLocalStorage('gnmDisclaimerAccepted_v2_09052025', false);
    
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isIosInstallModalOpen, setIsIosInstallModalOpen] = useState(false);


    useEffect(() => {
        // Check for iOS
        const iosCheck = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        setIsIos(iosCheck);
        // Check if running as a standalone app
        const standaloneCheck = ('standalone' in window.navigator) && ((window.navigator as any).standalone === true);
        setIsStandalone(standaloneCheck);

        // Standard PWA prompt logic
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallPrompt = () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            installPromptEvent.userChoice.then((choiceResult: { outcome: string }) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                setInstallPromptEvent(null);
            });
        } else if (isIos && !isStandalone) {
            // If it's iOS, open our custom instruction modal instead.
            setIsIosInstallModalOpen(true);
        }
    };

    // Determine if the download button should be shown at all.
    const showDownloadButton = !!installPromptEvent || (isIos && !isStandalone);


    const userKey = user?.username || '';
    const [mentorConfig, setMentorConfig] = useLocalStorage<MentorConfig>(`gnmMentorConfig_${userKey}`, { name: 'Mentor', personality: 'malcolm-kingley' });
    const [reportData, setReportData] = useLocalStorage<ReportData | null>(`gnmReportData_${userKey}`, null);
    const [selfAwarenessProtocol] = useLocalStorage<SelfAwarenessProtocol | null>(`gnmSelfAwarenessProtocol_${userKey}`, null);


    const handleDeleteProfile = useCallback(() => {
        if (user) {
            deleteUserAccount();
            setIsSettingsOpen(false);
        }
    }, [user, deleteUserAccount]);

    const handleAcceptDisclaimer = () => {
        setHasAcceptedDisclaimer(true);
    };

    const handleOpenPlugin = () => {
        setIsPluginModalOpen(true);
    };

    const handleClosePlugin = () => {
        setIsPluginModalOpen(false);
    };

    if (!isAccessGranted) {
        return <AccessGate onAccessGranted={() => setIsAccessGranted(true)} />;
    }
    
    if (!isAuthenticated || !user) {
        return <Login onLogin={login} />;
    }

    if (!isTrialActive) {
        return <TrialExpired onLogout={logout} />;
    }

    return (
        <div className="flex h-screen bg-[#0a192f] text-slate-300">
            <Navigation 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onLogout={logout} 
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenBookViewer={() => setIsBookViewerOpen(true)}
                onOpenPlugin={handleOpenPlugin}
                isReportAvailable={!!reportData}
                timeRemaining={timeRemaining}
                isInstallPromptAvailable={showDownloadButton}
                onInstallPrompt={handleInstallPrompt}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className={`flex-1 pt-16 md:pt-0 ${activeView === 'mentor' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    {activeView === 'blueprint' && <Blueprint user={user} reportData={reportData} setReportData={setReportData} />}
                    {activeView === 'mentor' && <Mentor user={user} mentorConfig={mentorConfig} reportData={reportData} selfAwarenessProtocol={selfAwarenessProtocol} />}
                    {activeView === 'notebook' && <Notebook user={user} setActiveView={setActiveView} />}
                    {activeView === 'self-awareness' && <SelfAwareness user={user} setActiveView={setActiveView} reportData={reportData} />}
                    {activeView !== 'mentor' && <Footer />}
                </main>
                {/* New Desktop/Tablet Footer */}
                <footer className="hidden md:block flex-shrink-0 w-full text-center p-4 text-xs text-slate-500 border-t border-slate-800 bg-slate-900 no-print">
                    <div className="max-w-4xl mx-auto space-y-1">
                        <p>© 2025 Malcolm Kingley. All Rights Reserved.</p>
                        <p>KINGLEY FOUNDATION 508(c)(1)(a) Private Church Organization.</p>
                        <p>Unauthorized reproduction, distribution, or derivative use of this content is strictly prohibited.</p>
                        <p>Educational and spiritual content provided for private members only; not medical, legal, or financial advice.</p>
                    </div>
                </footer>
            </div>
            
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                mentorConfig={mentorConfig}
                onMentorConfigChange={setMentorConfig}
                onDeleteProfile={handleDeleteProfile}
            />
            <BookViewerModal 
                isOpen={isBookViewerOpen}
                onClose={() => setIsBookViewerOpen(false)}
            />
            <PluginModal
                isOpen={isPluginModalOpen}
                onClose={handleClosePlugin}
            />
            <DisclaimerModal 
                isOpen={!hasAcceptedDisclaimer} 
                onAccept={handleAcceptDisclaimer}
            />
            {isIosInstallModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-sm border border-slate-700 p-6 text-center">
                    <h2 className="text-xl font-bold text-[#c9a445] mb-4">Install BioCode App</h2>
                    <p className="text-slate-300 mb-6 text-left">To install this app on your device, tap the 'Share' icon (<ShareIosIcon />) in your browser's toolbar, then scroll down and select 'Add to Home Screen'.</p>
                    <Button onClick={() => setIsIosInstallModalOpen(false)} className="w-full">
                      Close
                    </Button>
                  </div>
                </div>
            )}
        </div>
    );
}

export default App;