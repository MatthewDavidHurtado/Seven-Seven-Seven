import React, { useState, useEffect } from 'react';
import { MentorConfig } from '../types';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';
import { TrashIcon } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorConfig: MentorConfig;
  onMentorConfigChange: (config: MentorConfig) => void;
  onDeleteProfile: () => void;
}

const personalityOptions: { value: MentorConfig['personality']; label: string }[] = [
    { value: 'malcolm-kingley', label: 'Malcolm Kingley' },
    { value: 'fun-doctor-jim', label: 'Fun Doctor Jim' },
    { value: 'loving-mother-mary', label: 'Loving Mother Mary' },
    { value: 'coach-ekhart', label: 'Coach Ekhart' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  mentorConfig, 
  onMentorConfigChange, 
  onDeleteProfile 
}) => {
  const [tempConfig, setTempConfig] = useState<MentorConfig>(mentorConfig);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  useEffect(() => {
    setTempConfig(mentorConfig);
  }, [mentorConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onMentorConfigChange(tempConfig);
    onClose();
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteProfile();
    setIsConfirmOpen(false);
    onClose();
  };
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTempConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
      >
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700 p-6">
          <h2 id="settings-modal-title" className="text-xl font-bold text-[#c9a445] mb-6">Application Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Name Your Mentor</label>
              <input
                type="text"
                name="name"
                id="name"
                value={tempConfig.name}
                onChange={handleConfigChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
              />
            </div>
            
            <div>
              <label htmlFor="personality" className="block text-sm font-medium text-slate-300 mb-1">Choose Mentor's Personality Style</label>
               <select
                name="personality"
                id="personality"
                value={tempConfig.personality}
                onChange={handleConfigChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]"
               >
                {personalityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
               </select>
            </div>

            <div className="border-t border-slate-700 pt-6">
                 <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
                 <p className="text-sm text-slate-400 mt-1 mb-3">This action is irreversible. All your timeline data, analyses, chats, and your account will be permanently deleted.</p>
                 <Button variant="danger" onClick={handleDeleteClick}>
                    <TrashIcon />
                    Delete My Profile
                 </Button>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Profile Deletion"
        confirmText="Yes, Delete Everything"
        confirmVariant="danger"
      >
        <p>Are you absolutely sure you want to delete your entire profile? This will remove your account and all associated data permanently. This action cannot be undone.</p>
      </ConfirmationModal>
    </>
  );
};

export default SettingsModal;
