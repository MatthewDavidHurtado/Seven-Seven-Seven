import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData, TimelineAnalysisEntry, AdvancedTrigger } from '../types';
import Button from './Button';
import { TrashIcon, PlusIcon } from '../constants';

interface ReportProps {
  reportData: ReportData | null;
  setReportData: (data: ReportData | null) => void;
}

const ReportSection: React.FC<{title: string; children: React.ReactNode; className?: string}> = ({ title, children, className }) => (
    <div className={`mb-10 ${className}`}>
        <h2 className="text-2xl font-brand font-bold text-[#c9a445] border-b-2 border-slate-700 pb-2 mb-4 tracking-wider">{title}</h2>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-3 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
            {children}
        </div>
    </div>
);

const EditableField: React.FC<{value: string, onChange: (val: string) => void, isEditing: boolean, isTextarea?: boolean, rows?: number}> = 
({value, onChange, isEditing, isTextarea, rows=3}) => {
    if (!isEditing) {
        return <p>{value}</p>;
    }
    if (isTextarea) {
        return <textarea className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200" rows={rows} value={value} onChange={e => onChange(e.target.value)} />;
    }
    return <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200" value={value} onChange={e => onChange(e.target.value)} />;
};

const EditableList: React.FC<{items: string[], onUpdate: (items: string[]) => void, isEditing: boolean}> = ({items, onUpdate, isEditing}) => {
    const handleItemChange = (val: string, index: number) => {
        const newItems = [...items];
        newItems[index] = val;
        onUpdate(newItems);
    };
    const handleAddItem = () => onUpdate([...items, 'New item']);
    const handleDeleteItem = (index: number) => onUpdate(items.filter((_, i) => i !== index));

    if (!isEditing) {
        return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
    }
    
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                    <input type="text" className="flex-grow bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200" value={item} onChange={e => handleItemChange(e.target.value, i)} />
                    <Button variant="danger" size="sm" onClick={() => handleDeleteItem(i)}><TrashIcon/></Button>
                </div>
            ))}
            <Button size="sm" onClick={handleAddItem}><PlusIcon/> Add Item</Button>
        </div>
    );
}

// This helper type will get all keys from T that have object-like values (including arrays).
// It will exclude keys that have primitive values like string or number.
type KeysWithObjectValues<T> = {
  [K in keyof T]: T[K] extends object ? K : never;
}[keyof T];

const Report: React.FC<ReportProps> = ({ reportData, setReportData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<ReportData | null>(reportData);

  useEffect(() => {
    setLocalData(reportData);
  }, [reportData]);

  if (!localData) {
    return <div className="text-center p-10">No report data available. Please generate a report first.</div>;
  }

  const handleDownload = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    const {
        caseSummary, timelineAnalysis, conflictMapping, advancedTriggerReasoning,
        spiritualComponent, actionProtocol, expectedHealingPhase, finalAnchor, nextSteps,
    } = reportData;

    let finalY = 15;
    const margin = 15;

    // --- Title ---
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Biological Code Analysis & Resolution Protocol', doc.internal.pageSize.width / 2, finalY, { align: 'center' });
    finalY += 10;
    doc.setDrawColor(150);
    doc.line(margin, finalY, doc.internal.pageSize.width - margin, finalY);
    finalY += 10;

    const addSectionTitle = (title: string) => {
        autoTable(doc, {
            body: [[title.toUpperCase()]],
            startY: finalY,
            theme: 'plain',
            styles: { fontStyle: 'bold', fontSize: 12, cellPadding: { top: 4, bottom: 2 } }
        });
        finalY = (doc as any).lastAutoTable.finalY;
    };

    const addText = (text: string | string[], options: { isList?: boolean; isBold?: boolean } = {}) => {
        const { isList = false, isBold = false } = options;
        const content = Array.isArray(text)
            ? text.map(item => (isList ? `• ${item}` : item)).join('\n')
            : (isList ? `• ${text}` : text);

        autoTable(doc, {
            body: [[content]],
            startY: finalY,
            theme: 'plain',
            styles: {
                fontStyle: isBold ? 'bold' : 'normal',
                fontSize: 10,
                cellPadding: { top: 2, bottom: 2 },
            }
        });
        finalY = (doc as any).lastAutoTable.finalY;
    };
    
    // Case Summary
    addSectionTitle('Case Summary');
    addText(`Case: ${caseSummary.caseDetails}`, { isBold: true });
    addText(`Symptoms & Traits: ${caseSummary.symptoms}`);
    finalY += 5;

    // Timeline Analysis Table
    addSectionTitle('Timeline Analysis (GNM Framework)');
    autoTable(doc, {
        head: [['Age/Event', 'Phase', 'Conflict Type', 'Biological Purpose', 'Track Identified']],
        body: timelineAnalysis.map(row => [row.ageEvent, row.phase, row.conflictType, row.biologicalPurpose, row.trackIdentified]),
        startY: finalY,
        theme: 'striped',
        headStyles: { fillColor: [41, 52, 65] },
        styles: { fontSize: 8, cellPadding: 2 },
    });
    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Conflict Mapping
    addSectionTitle('Conflict Mapping');
    addText('1. Primary Conflicts:', { isBold: true });
    addText(conflictMapping.primaryConflicts, { isList: true });
    finalY += 4;
    addText('2. Secondary Conflicts:', { isBold: true });
    addText(conflictMapping.secondaryConflicts, { isList: true });
    finalY += 5;

    // Advanced Trigger Reasoning
    if (advancedTriggerReasoning && advancedTriggerReasoning.length > 0) {
        addSectionTitle('Advanced Trigger Reasoning');
        autoTable(doc, {
            head: [['Symptom', 'Biological Purpose', 'Triggers']],
            body: advancedTriggerReasoning.map(row => [row.symptom, row.biologicalPurpose, row.triggers]),
            startY: finalY,
            theme: 'striped',
            headStyles: { fillColor: [41, 52, 65] },
            styles: { fontSize: 8, cellPadding: 2 },
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Spiritual Component
    addSectionTitle('Spiritual Component');
    addText('Denial:', { isBold: true });
    addText(spiritualComponent.denial);
    finalY+=4;
    addText('Affirmation:', { isBold: true });
    addText(spiritualComponent.affirmation);
    finalY += 5;
    
    // Action Protocol
    addSectionTitle('Action Protocol');
    addText('GNM Commands:', { isBold: true });
    addText(actionProtocol.gnmCommands, { isList: true });
    finalY+=4;
    addText('Track Neutralization:', { isBold: true });
    addText(actionProtocol.trackNeutralization, { isList: true });
    finalY+=4;
    addText('Nutritional Support:', { isBold: true });
    addText(actionProtocol.nutritionalSupport, { isList: true });
    finalY += 5;

    // Expected Healing Phase
    addSectionTitle('Expected Healing Phase');
    addText(expectedHealingPhase, { isList: true });
    finalY += 5;
    
    // Final Anchor
    addSectionTitle('Final Anchor');
    addText(finalAnchor);
    finalY += 5;

    // Next Steps
    addSectionTitle('Next Steps');
    addText(nextSteps);
    
    doc.save('Biological_Code_Blueprint.pdf');
  };

  const handleFieldChange = (section: KeysWithObjectValues<ReportData>, field: any, value: any) => {
    setLocalData(prev => prev ? ({ ...prev, [section]: { ...prev[section], [field]: value } }) : null);
  };
  
  const handleListUpdate = (section: KeysWithObjectValues<ReportData>, field: any, value: any) => {
      setLocalData(prev => prev ? ({ ...prev, [section]: { ...prev[section], [field]: value } }) : null);
  }

  const handleTableUpdate = (newTableData: TimelineAnalysisEntry[]) => {
      setLocalData(prev => prev ? ({ ...prev, timelineAnalysis: newTableData }) : null);
  }
  
  const handleSave = () => {
      setReportData(localData);
      setIsEditing(false);
  };
  
  const handleCancel = () => {
      setLocalData(reportData);
      setIsEditing(false);
  };

  const {
    caseSummary, timelineAnalysis, conflictMapping, advancedTriggerReasoning,
    spiritualComponent, actionProtocol, expectedHealingPhase, finalAnchor, nextSteps,
  } = localData;

  return (
    <div className="container mx-auto my-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-2 no-print mb-8">
            <h1 className="text-2xl text-center md:text-left md:text-4xl font-brand text-slate-200">Your Biological Code Blueprint</h1>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Report</Button>
                  <Button onClick={handleDownload}>Download Report</Button>
                </>
              )}
            </div>
        </div>
        <div id="print-area" className="p-8 bg-slate-800/80 border border-slate-700 rounded-lg shadow-2xl print-area">
            <h1 className="text-center text-3xl font-brand font-bold text-[#c9a445] mb-2 tracking-widest">Biological Code Analysis & Resolution Protocol</h1>
            <hr className="border-slate-600 mb-10"/>

            <ReportSection title="CASE SUMMARY">
                <p><strong>Case:</strong></p>
                <EditableField value={caseSummary.caseDetails} onChange={val => handleFieldChange('caseSummary', 'caseDetails', val)} isEditing={isEditing} />
                <p className="mt-2"><strong>Symptoms & Traits:</strong></p>
                <EditableField value={caseSummary.symptoms} onChange={val => handleFieldChange('caseSummary', 'symptoms', val)} isEditing={isEditing} isTextarea />
            </ReportSection>

            <EditableTimelineTable data={timelineAnalysis} onUpdate={handleTableUpdate} isEditing={isEditing} />
            
            <ReportSection title="CONFLICT MAPPING" className="mt-10">
                <h3 className="text-xl font-semibold text-slate-200">1. Primary Conflicts:</h3>
                <EditableList items={conflictMapping.primaryConflicts} onUpdate={items => handleListUpdate('conflictMapping', 'primaryConflicts', items)} isEditing={isEditing} />
                <h3 className="text-xl font-semibold text-slate-200 mt-4">2. Secondary Conflicts:</h3>
                <EditableList items={conflictMapping.secondaryConflicts} onUpdate={items => handleListUpdate('conflictMapping', 'secondaryConflicts', items)} isEditing={isEditing} />
            </ReportSection>
            
            {/* ... Other sections would be converted similarly ... */}

            <ReportSection title="FINAL ANCHOR">
                <EditableField value={finalAnchor} onChange={val => setLocalData(d => d ? {...d, finalAnchor: val} : null)} isEditing={isEditing} isTextarea />
            </ReportSection>
        </div>
    </div>
  );
};

const EditableTimelineTable: React.FC<{data: TimelineAnalysisEntry[], onUpdate: (data: TimelineAnalysisEntry[]) => void, isEditing: boolean}> = ({ data, onUpdate, isEditing }) => {
    const handleCellChange = (rowIndex: number, field: keyof TimelineAnalysisEntry, value: string) => {
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [field]: value };
        onUpdate(newData);
    };

    const handleAddRow = () => {
        onUpdate([...data, { ageEvent: '', phase: '', conflictType: '', biologicalPurpose: '', trackIdentified: '' }]);
    };
    
    const handleDeleteRow = (rowIndex: number) => {
        onUpdate(data.filter((_, i) => i !== rowIndex));
    };

    return (
        <ReportSection title="TIMELINE ANALYSIS (GNM FRAMEWORK)">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50">
                            <th className="p-2 border border-slate-600">Age/Event</th>
                            <th className="p-2 border border-slate-600">Phase</th>
                            <th className="p-2 border border-slate-600">Conflict Type</th>
                            <th className="p-2 border border-slate-600">Biological Purpose</th>
                            <th className="p-2 border border-slate-600">Track Identified</th>
                            {isEditing && <th className="p-2 border border-slate-600 w-16"></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className="border-b border-slate-700">
                                {Object.keys(row).map(key => (
                                    <td key={key} className="p-0 border border-slate-600 align-top">
                                        {isEditing ? (
                                            <textarea 
                                                className="w-full h-full bg-slate-900 p-2 text-slate-200 border-0 focus:ring-1 focus:ring-[#c9a445]" 
                                                value={row[key as keyof TimelineAnalysisEntry]} 
                                                onChange={e => handleCellChange(index, key as keyof TimelineAnalysisEntry, e.target.value)}
                                                rows={3}
                                            />
                                        ) : (
                                            <p className="p-2">{row[key as keyof TimelineAnalysisEntry]}</p>
                                        )}
                                    </td>
                                ))}
                                {isEditing && (
                                    <td className="p-2 border border-slate-600 align-middle text-center">
                                        <Button variant="danger" size="sm" onClick={() => handleDeleteRow(index)}><TrashIcon/></Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isEditing && <Button size="sm" onClick={handleAddRow} className="mt-4"><PlusIcon/> Add Row</Button>}
            </div>
        </ReportSection>
    );
}

export default Report;