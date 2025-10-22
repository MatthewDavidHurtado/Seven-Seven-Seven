import React, { useState } from 'react';
import { BrainCircuitIcon, MessageSquareIcon, SettingsIcon, BookOpenIcon, FileTextIcon, SparklesIcon, HeartIcon, PluginIcon, LightbulbIcon, MoreHorizontalIcon, CloseIcon, DownloadAppIcon } from '../constants';
import Button from './Button';
import TrialCountdown from './TrialCountdown';
import { TimeRemaining } from '../hooks/useTrial';

type ActiveView = 'blueprint' | 'mentor' | 'notebook' | 'self-awareness';

interface NavigationProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenBookViewer: () => void;
  onOpenPlugin: () => void;
  isReportAvailable: boolean;
  timeRemaining: TimeRemaining | null;
  isInstallPromptAvailable: boolean;
  onInstallPrompt: () => void;
}

// A generic navigation link component for use in sidebar and mobile menus
const NavLink: React.FC<{
  isActive?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  title?: string;
}> = ({ isActive = false, onClick, icon, label, disabled = false, title }) => {
  const baseClasses = "flex items-center gap-4 px-4 py-3 rounded-md text-sm font-semibold transition-colors duration-200 w-full text-left";
  const activeClasses = "bg-slate-700 text-[#c9a445]";
  const inactiveClasses = disabled 
    ? "text-slate-600 cursor-not-allowed" 
    : "text-slate-300 hover:bg-slate-800/50 hover:text-white";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`} disabled={disabled} title={title}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

// Shared navigation links logic for both desktop and mobile
const SharedNavLinks: React.FC<Pick<NavigationProps, 'activeView' | 'setActiveView' | 'isReportAvailable' | 'onOpenPlugin' | 'onOpenBookViewer' | 'isInstallPromptAvailable' | 'onInstallPrompt'> & { onLinkClick?: () => void }> = ({ activeView, setActiveView, isReportAvailable, onOpenPlugin, onOpenBookViewer, isInstallPromptAvailable, onInstallPrompt, onLinkClick = () => {} }) => {
  const handleNavClick = (view: ActiveView) => {
    setActiveView(view);
    onLinkClick();
  };

  return (
    <>
      <NavLink 
        isActive={activeView === 'blueprint'}
        onClick={() => handleNavClick('blueprint')}
        icon={<BrainCircuitIcon />}
        label="Blueprint"
      />
      <NavLink 
        isActive={activeView === 'mentor'}
        onClick={() => handleNavClick('mentor')}
        icon={<MessageSquareIcon />}
        label="Mentor"
      />
       <NavLink
        isActive={activeView === 'self-awareness'}
        onClick={() => handleNavClick('self-awareness')}
        icon={<LightbulbIcon />}
        label="Become Self-Aware"
        disabled={!isReportAvailable}
        title={!isReportAvailable ? "Generate a report in the Blueprint tab first." : "Generate Self-Awareness Protocol"}
      />
      <NavLink 
        isActive={activeView === 'notebook'}
        onClick={() => handleNavClick('notebook')}
        icon={<FileTextIcon />}
        label="Notebook"
      />
      <a
        href="https://calendly.com/sealintelligence/spiritual-consultation"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onLinkClick}
        className="flex items-center gap-4 px-4 py-3 rounded-md text-sm font-semibold transition-colors duration-200 text-slate-300 hover:bg-slate-800/50 hover:text-white w-full"
      >
        <SparklesIcon />
        <span>VIP Mentorship</span>
      </a>
      <a
        href="https://allow-ministries-tithing-app-779946580524.us-west1.run.app/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onLinkClick}
        className="flex items-center gap-4 px-4 py-3 rounded-md text-sm font-semibold transition-colors duration-200 text-slate-300 hover:bg-slate-800/50 hover:text-white w-full"
      >
        <HeartIcon />
        <span>Tithe</span>
      </a>
      <NavLink 
        onClick={() => { onOpenBookViewer(); onLinkClick(); }}
        icon={<BookOpenIcon />}
        label="The Energy Leak"
      />
      <NavLink 
        onClick={() => { onOpenPlugin(); onLinkClick(); }}
        icon={<PluginIcon />}
        label="Plugins"
      />
      {isInstallPromptAvailable && (
          <NavLink 
            onClick={() => { onInstallPrompt(); onLinkClick(); }}
            icon={<DownloadAppIcon />}
            label="Download App"
          />
      )}
    </>
  );
};


const DesktopSidebar: React.FC<NavigationProps> = (props) => (
  <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 flex-shrink-0 border-r border-slate-800">
    <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <img src="https://i.imgur.com/1XKnKzI.png" alt="Biological Code Logo" className="w-10 h-10" />
        <div>
            <h1 className="text-lg font-bold text-[#c9a445] font-brand leading-tight">BIOLOGICAL CODE</h1>
            <p className="text-xs text-slate-400 font-brand tracking-wide">DISCOVERY & MENTORSHIP</p>
        </div>
    </div>

    <nav className="flex-grow p-2 space-y-1">
      <SharedNavLinks {...props} />
    </nav>

    <div className="p-3 border-t border-slate-800 space-y-3">
        <TrialCountdown timeRemaining={props.timeRemaining} />
        <div className="flex items-center justify-between gap-2">
            <Button variant="secondary" size="sm" onClick={props.onOpenSettings} className="w-full">
                <SettingsIcon /> Settings
            </Button>
            <Button variant="secondary" size="sm" onClick={props.onLogout} className="w-full">Log Out</Button>
        </div>
    </div>
  </aside>
);

const MobileTopNav: React.FC<NavigationProps> = (props) => {
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    
    const MobileNavLink: React.FC<{view: any, label: string, icon: React.ReactNode}> = ({view, label, icon}) => (
         <button 
            onClick={() => props.setActiveView(view)} 
            className={`flex flex-col items-center justify-center text-xs gap-1 w-full transition-colors ${props.activeView === view ? 'text-[#c9a445]' : 'text-slate-400 hover:text-white'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    return (
        <>
            <nav className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 flex justify-around items-center h-16 z-40">
                <MobileNavLink view="blueprint" label="Blueprint" icon={<BrainCircuitIcon />} />
                <MobileNavLink view="mentor" label="Mentor" icon={<MessageSquareIcon />} />
                <MobileNavLink view="notebook" label="Notebook" icon={<FileTextIcon />} />
                <button 
                    onClick={() => setIsMoreMenuOpen(true)}
                    className="flex flex-col items-center justify-center text-xs gap-1 w-full text-slate-400 hover:text-white"
                >
                    <MoreHorizontalIcon />
                    <span>More</span>
                </button>
            </nav>

            {/* "More" Menu Panel */}
            {isMoreMenuOpen && (
                 <div className="fixed inset-0 z-50 bg-[#0a192f] p-4 flex flex-col md:hidden">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-[#c9a445] font-brand">Menu</h2>
                        <Button variant="secondary" size="sm" onClick={() => setIsMoreMenuOpen(false)}>
                            <CloseIcon />
                        </Button>
                    </div>
                    <nav className="flex-grow overflow-y-auto space-y-2">
                        <SharedNavLinks {...props} onLinkClick={() => setIsMoreMenuOpen(false)} />
                    </nav>
                     <div className="flex-shrink-0 pt-4 space-y-3">
                        <TrialCountdown timeRemaining={props.timeRemaining} />
                        <div className="flex items-center gap-3">
                            <Button variant="secondary" onClick={() => { props.onOpenSettings(); setIsMoreMenuOpen(false); }} className="w-full"><SettingsIcon /> Settings</Button>
                            <Button variant="secondary" onClick={() => { props.onLogout(); setIsMoreMenuOpen(false); }} className="w-full">Log Out</Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};


const Navigation: React.FC<NavigationProps> = (props) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileTopNav {...props} />
    </>
  );
};

export default Navigation;