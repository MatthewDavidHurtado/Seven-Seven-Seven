import React from 'react';
import Button from './Button';
import { PlusIcon, BrainCircuitIcon, FileTextIcon, CameraIcon } from '../constants';

interface HeaderProps {
  onAddEvent: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onScan: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalysisDisabled: boolean;
  isReportAvailable: boolean;
  onGenerateReport: () => void;
  view: 'timeline' | 'report';
  onSetView: (view: 'timeline' | 'report') => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onAddEvent, onAnalyze, onExport, onImport, onScan, isAnalysisDisabled, 
  isReportAvailable, onGenerateReport, view, onSetView 
}) => {
  const importInputRef = React.useRef<HTMLInputElement>(null);
  const scanInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="bg-slate-900/50 backdrop-blur-sm p-3 sticky top-0 z-20 border-b border-slate-700 no-print">
      <div className="container mx-auto flex flex-col md:flex-row justify-end items-center gap-4 md:gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {view === 'timeline' ? (
            <>
              <input type="file" accept=".json" ref={importInputRef} className="hidden" onChange={onImport} />
              <input type="file" accept="image/*,application/pdf" ref={scanInputRef} className="hidden" onChange={onScan} multiple />
              <Button variant="secondary" size="sm" onClick={() => scanInputRef.current?.click()}>
                <CameraIcon />
                Scan/Add
              </Button>
              <Button variant="secondary" size="sm" onClick={() => importInputRef.current?.click()}>Import</Button>
              <Button variant="secondary" size="sm" onClick={onExport}>Export</Button>
              <Button variant="secondary" size="sm" onClick={onAnalyze} disabled={isAnalysisDisabled}>
                <BrainCircuitIcon />
                Analyze
              </Button>
              <Button variant="secondary" size="sm" onClick={onGenerateReport} disabled={!isReportAvailable}>
                <FileTextIcon />
                Report
              </Button>
              <Button onClick={onAddEvent} size="sm">
                <PlusIcon />
                Add Conflict
              </Button>
            </>
          ) : (
             <Button onClick={() => onSetView('timeline')}>
                Back to Timeline
              </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;