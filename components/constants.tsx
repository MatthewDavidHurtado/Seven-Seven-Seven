import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
} as const;

export const PlusIcon: React.FC = () => <svg {...iconProps}><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
export const BrainCircuitIcon: React.FC = () => <svg {...iconProps}><path d="M12 5V3"/><path d="M12 11v-2"/><path d="M12 21v-2"/><path d="m15 6-1-1"/><path d="m9 6 1-1"/><path d="m15 18-1 1"/><path d="m9 18 1 1"/><path d="m6 9-1-1"/><path d="m6 15-1 1"/><path d="m18 9 1-1"/><path d="m18 15 1 1"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M17.6 7.2c.2-.2.3-.5.3-.8a2.5 2.5 0 0 0-4.1-2.9"/><path d="M6.4 7.2c-.2-.2-.3-.5-.3-.8a2.5 2.5 0 0 1 4.1-2.9"/><path d="M17.6 16.8c.2.2.3.5.3.8a2.5 2.5 0 0 1-4.1 2.9"/><path d="M6.4 16.8c-.2.2-.3.5-.3.8a2.5 2.5 0 0 0 4.1 2.9"/></svg>;
export const FileTextIcon: React.FC = () => <svg {...iconProps}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
export const CameraIcon: React.FC = () => <svg {...iconProps}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
export const MicrophoneIcon: React.FC = () => <svg {...iconProps}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="23"/><line x1="8" x2="16" y1="23" y2="23"/></svg>;
export const EditIcon: React.FC = () => <svg {...iconProps}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>;
export const TrashIcon: React.FC = () => <svg {...iconProps}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
export const ChevronDownIcon: React.FC = () => <svg {...iconProps}><path d="m6 9 6 6 6-6"/></svg>;
export const ShareIosIcon: React.FC = () => <svg {...iconProps} className="w-5 h-5 inline-block"><rect x="9" y="8" width="6" height="7" rx="1" /><path d="M12 19v-7" /><path d="M9 12H5l4-4 4 4h-4" /></svg>;
export const SparklesIcon: React.FC = () => <svg {...iconProps}><path d="M9.93 2.25a2.12 2.12 0 0 0-2.86 0L2.25 7.07a2.12 2.12 0 0 0 0 2.86l4.82 4.82a2.12 2.12 0 0 0 2.86 0l4.82-4.82a2.12 2.12 0 0 0 0-2.86Z"/><path d="m18 11-2.5 2.5"/><path d="m21 8-2.5 2.5"/><path d="m14 4-2.5 2.5"/><path d="M21 14.85a2.12 2.12 0 0 1-2.86 0l-4.82-4.82a2.12 2.12 0 0 1 0-2.86l4.82-4.82a2.12 2.12 0 0 1 2.86 0Z"/></svg>;
export const LogInIcon: React.FC = () => <svg {...iconProps}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
export const MessageSquareIcon: React.FC = () => <svg {...iconProps}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
export const SettingsIcon: React.FC = () => <svg {...iconProps}><path d="M12.22 2h.01"/><path d="M6.05 5.24 7.5 6.69"/><path d="m2 12.22-.01.01"/><path d="M5.24 17.95 6.69 16.5"/><path d="M12.22 22h.01"/><path d="M17.95 17.95 16.5 16.69"/><path d="m22 12.22-.01.01"/><path d="M17.95 6.24 16.5 7.69"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="10"/></svg>;
export const BookOpenIcon: React.FC = () => <svg {...iconProps}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
export const HeartIcon: React.FC = () => <svg {...iconProps}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
export const PluginIcon: React.FC = () => <svg {...iconProps}><path d="M12 20v-4"/><path d="M12 4V2"/><path d="m14.5 18.5-1-1"/><path d="m9.5 18.5 1-1"/><path d="m14.5 5.5-1 1"/><path d="m9.5 5.5 1 1"/><path d="M20 12h-4"/><path d="M4 12h4"/><path d="m18.5 14.5-1-1"/><path d="m5.5 14.5 1-1"/><path d="m18.5 9.5-1 1"/><path d="m5.5 9.5 1 1"/><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/></svg>;
export const LightbulbIcon: React.FC = () => <svg {...iconProps}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
export const MoreHorizontalIcon: React.FC = () => <svg {...iconProps}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>;
export const CloseIcon: React.FC = () => <svg {...iconProps}><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>;
export const RewireMindIcon: React.FC = () => <svg {...iconProps}><path d="M15.2 2.8a2.4 2.4 0 0 0-3.2 0L8.4 6.4a2.4 2.4 0 0 0 0 3.2l3.6 3.6a2.4 2.4 0 0 0 3.2 0l3.6-3.6a2.4 2.4 0 0 0 0-3.2Z"/><path d="m6 15 4-4"/><path d="M15 6l-4 4"/><path d="m6 9 3 3"/><path d="M9 12 6 15"/><path d="M3.2 12.8a2.4 2.4 0 0 0 0 3.2l3.6 3.6a2.4 2.4 0 0 0 3.2 0l3.6-3.6a2.4 2.4 0 0 0 0-3.2"/></svg>;
export const DownloadAppIcon: React.FC = () => <svg {...iconProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
export const SearchIcon: React.FC = () => <svg {...iconProps}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
export const ClipboardIcon: React.FC = () => <svg {...iconProps}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>;
export const DownloadIcon: React.FC = () => <svg {...iconProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" y2="3"/></svg>;
export const UploadIcon: React.FC = () => <svg {...iconProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
export const SendIcon: React.FC = () => <svg {...iconProps}><path d="m22 2-7 20-4-9-9-4Z"/><path d="m22 2-11 11"/></svg>;