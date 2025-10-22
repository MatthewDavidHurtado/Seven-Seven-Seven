import React, { useState, useEffect } from 'react';
import { ConflictEvent } from '../types';
import Button from './Button';
import BodyMap from './BodyMap';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<ConflictEvent, 'id' | 'conflictType' | 'germLayer' | 'healingSymptoms' | 'gnmExplanation'>) => void;
  eventToEdit: ConflictEvent | null;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSubmit, eventToEdit }) => {
  const [formData, setFormData] = useState({
    age: '',
    date: '',
    description: '',
    characters: '',
    feelings: '',
    bodyLocation: '',
  });

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        age: eventToEdit.age.toString(),
        date: eventToEdit.date,
        description: eventToEdit.description,
        characters: eventToEdit.characters,
        feelings: eventToEdit.feelings,
        bodyLocation: eventToEdit.bodyLocation,
      });
    } else {
      setFormData({ age: '', date: '', description: '', characters: '', feelings: '', bodyLocation: '' });
    }
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBodyLocationSelect = (location: string) => {
    setFormData(prev => ({ ...prev, bodyLocation: location }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, age: parseInt(formData.age, 10) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-[#c9a445] mb-4 font-brand tracking-wider">{eventToEdit ? 'Edit' : 'Document'} a Conflict Shock (DHS)</h2>
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Describe an event that was unexpected, acute, and experienced in isolation.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-slate-300 mb-1">Your Age</label>
                  <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]" />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Approximate Date</label>
                  <input type="text" name="date" id="date" value={formData.date} onChange={handleChange} placeholder="e.g., March 2010" required className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]" />
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Describe the event</label>
                <textarea name="description" id="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]" />
              </div>
              <div>
                <label htmlFor="characters" className="block text-sm font-medium text-slate-300 mb-1">Who was involved? (e.g., boss, partner, self)</label>
                <input type="text" name="characters" id="characters" value={formData.characters} onChange={handleChange} required className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]" />
              </div>
              <div>
                <label htmlFor="feelings" className="block text-sm font-medium text-slate-300 mb-1">How did you feel? What were your exact thoughts?</label>
                <textarea name="feelings" id="feelings" value={formData.feelings} onChange={handleChange} required rows={2} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Where did you feel it in your body?</label>
                <BodyMap selectedLocation={formData.bodyLocation} onLocationSelect={handleBodyLocationSelect} />
                <input type="hidden" name="bodyLocation" value={formData.bodyLocation} />
              </div>
            </div>
          </div>
          <div className="bg-slate-900/50 px-6 py-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit">{eventToEdit ? 'Save Changes' : 'Add to Timeline'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;