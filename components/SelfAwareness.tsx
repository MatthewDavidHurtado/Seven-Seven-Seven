import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthUser, ReportData, SelfAwarenessProtocol, TimelineData, AiAnalysis } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Button from './Button';
import Loader from './Loader';
import * as geminiService from '../services/geminiService';
import { LightbulbIcon, DownloadIcon } from '../constants';
import ConfirmationModal from './ConfirmationModal';

interface SelfAwarenessProps {
    user: AuthUser;
    setActiveView: (view: 'blueprint' | 'mentor' | 'notebook' | 'self-awareness') => void;
    reportData: ReportData | null;
}

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mb-8">
        <h3 className="text-xl font-bold text-[#c9a445] font-brand tracking-wider border-b-2 border-slate-700 pb-2 mb-4">{title}</h3>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-3">{children}</div>
    </div>
);

const SelfAwareness: React.FC<SelfAwarenessProps> = ({ user, setActiveView, reportData }) => {
    const userKey = user.username;
    const [timelineData] = useLocalStorage<TimelineData | null>(`gnmTimelineData_${userKey}`, null);
    const [aiAnalysis] = useLocalStorage<AiAnalysis | null>(`gnmAiAnalysis_${userKey}`, null);
    
    const [protocol, setProtocol] = useLocalStorage<SelfAwarenessProtocol | null>(`gnmSelfAwarenessProtocol_${userKey}`, null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);

    const handleGenerate = async () => {
        if (!reportData || !timelineData || !aiAnalysis) {
            setError("Missing required data. Please ensure you have a complete timeline, analysis, and report.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await geminiService.generateSelfAwarenessProtocol(timelineData, aiAnalysis, reportData);
            setProtocol(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred during protocol generation.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmRegenerate = () => {
        setIsRegenerateConfirmOpen(false);
        handleGenerate();
    };

    const handleDownload = () => {
        if (!protocol) return;
        const doc = new jsPDF();
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        let finalY = 15;
    
        // Main Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text("Self-Awareness & Resolution Protocol", pageWidth / 2, finalY, { align: 'center' });
        finalY += 15;

        // Helper to add sections using autoTable for robust page breaking
        const addSection = (title: string, content: string | string[], isList = false) => {
            const bodyContent = Array.isArray(content)
                ? content.map(item => [isList ? `• ${item}` : item])
                : [[content]];

            autoTable(doc, {
                body: [[{ content: title, styles: { fontStyle: 'bold', fontSize: 12, textColor: [40, 40, 40] } }]],
                startY: finalY,
                theme: 'plain',
                styles: { cellPadding: { top: 4, bottom: 2 } },
            });
            let tableFinalY = (doc as any).lastAutoTable.finalY;

            autoTable(doc, {
                body: bodyContent,
                startY: tableFinalY,
                theme: 'plain',
                styles: { fontSize: 10, cellPadding: { top: 0, bottom: 2 } },
            });
            finalY = (doc as any).lastAutoTable.finalY + 8;
        };

        // Spiritual Remedy (Special formatting)
        autoTable(doc, {
            body: [
                [{ content: 'Your New Place of Dwelling in Consciousness', styles: { fontStyle: 'bold', fontSize: 14, halign: 'center' } }],
                [{ content: `"${protocol.spiritualRemedy.scripture}"`, styles: { fontStyle: 'italic', fontSize: 12, halign: 'center' } }],
                [{ content: protocol.spiritualRemedy.explanation, styles: { fontSize: 10, halign: 'center' } }],
            ],
            startY: finalY,
            theme: 'plain',
            styles: { cellPadding: { top: 2, bottom: 4 } },
        });
        finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setDrawColor(150);
        doc.line(margin, finalY - 5, pageWidth - margin, finalY - 5);

        // Add all other sections
        addSection("Predictive Energy Leak Analysis", protocol.predictiveAnalysis);
        addSection("Estimated Costs of Unresolved Tracks", [
            `Financial: ${protocol.quantifiedCosts.financial}`,
            `Physical: ${protocol.quantifiedCosts.physical}`,
            `Emotional: ${protocol.quantifiedCosts.emotional}`
        ], true);
        addSection("Highest Leverage Point for Resolution", `Theme: ${protocol.leveragePoint.theme}\n\nReasoning: ${protocol.leveragePoint.reasoning}`);
        addSection("Sequential Triggers for this Track", protocol.leveragePoint.sequentialTriggers, true);
        addSection("F. L. Rawson Retroactive Healing Script", protocol.leveragePoint.rawsonTreatmentScript);
        addSection("Identity Shift: Familiar Patterns to Release", protocol.identityShiftProtocol.familiarPatterns, true);
        addSection("Identity Shift: New Identity-Building Actions", protocol.identityShiftProtocol.newBehaviors, true);
        addSection("Future Forecast & Vision", protocol.futureForecast.vision);
        addSection("Potential Gains from Resolution", [
            `Financial: ${protocol.futureForecast.quantifiedGains.financial}`,
            `Physical: ${protocol.futureForecast.quantifiedGains.physical}`,
            `Emotional: ${protocol.futureForecast.quantifiedGains.emotional}`,
            `Spiritual: ${protocol.futureForecast.quantifiedGains.spiritual}`
        ], true);

        // Disclaimer (special smaller font)
        autoTable(doc, {
            body: [
                [{ content: 'Disclaimer', styles: { fontStyle: 'bold', fontSize: 10 } }],
                [{ content: protocol.disclaimer, styles: { fontSize: 8, textColor: [150, 150, 150] } }]
            ],
            startY: finalY,
            theme: 'plain',
            styles: { cellPadding: { top: 2, bottom: 2 } },
        });

        doc.save("Self_Awareness_Protocol.pdf");
    };

    if (!reportData) {
        return (
            <div className="container mx-auto p-8 text-center">
                <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 max-w-2xl mx-auto">
                    <LightbulbIcon />
                    <h2 className="text-2xl font-bold text-[#c9a445] mt-4 mb-2">Unlock Your Self-Awareness Protocol</h2>
                    <p className="text-slate-400 mb-6">This feature requires a completed Blueprint Report. Please go to the Blueprint tab, analyze your timeline, and generate your report first.</p>
                    <Button onClick={() => setActiveView('blueprint')}>Go to Blueprint</Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return <div className="p-10"><Loader text="Generating your advanced protocol... This may take a moment." /></div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="flex flex-col md:flex-row justify-between md:items-center mb-6 border-b border-slate-700 pb-4">
                <h1 className="text-3xl font-brand text-[#c9a445] flex items-center gap-3 mb-4 md:mb-0">
                    <LightbulbIcon />
                    Become Self-Aware
                </h1>
                {protocol && (
                     <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setIsRegenerateConfirmOpen(true)}>
                            Regenerate
                        </Button>
                        <Button onClick={handleDownload}>
                            <DownloadIcon />
                            Download PDF
                        </Button>
                    </div>
                )}
            </header>

            {error && <div className="bg-red-800 border border-red-600 text-white p-4 my-4 rounded-md" role="alert">{error}</div>}

            {!protocol ? (
                <div className="text-center py-20 bg-slate-800/50 rounded-lg">
                    <h2 className="text-2xl font-semibold text-slate-300">Generate Your Self-Awareness Protocol</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">This will perform an advanced analysis on your completed blueprint to reveal your highest leverage point for healing, quantify its impact, and provide a clear action plan for a 90-day breakthrough.</p>
                    <Button onClick={handleGenerate} className="mt-6">Generate Protocol</Button>
                </div>
            ) : (
                <div className="p-6 bg-slate-800/80 border border-slate-700 rounded-lg shadow-2xl">
                    <div className="mb-10 text-center border-b-2 border-slate-700 pb-8">
                        <h2 className="text-lg font-brand text-slate-300 tracking-wider">Your New Place of Dwelling in Consciousness</h2>
                        <p className="text-2xl md:text-3xl font-bold text-amber-300 font-serif italic my-4">
                            "{protocol.spiritualRemedy.scripture}"
                        </p>
                        <p className="text-slate-400 max-w-3xl mx-auto">{protocol.spiritualRemedy.explanation}</p>
                    </div>

                    <Section title="Predictive Energy Leak Analysis">
                        <p>{protocol.predictiveAnalysis}</p>
                    </Section>
                    
                    <Section title="Estimated Costs of Unresolved Tracks">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Financial:</strong> {protocol.quantifiedCosts.financial}</div>
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Physical:</strong> {protocol.quantifiedCosts.physical}</div>
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Emotional:</strong> {protocol.quantifiedCosts.emotional}</div>
                        </div>
                    </Section>

                    <Section title="Highest Leverage Point for Resolution">
                        <h4 className="text-lg font-semibold text-slate-100">{protocol.leveragePoint.theme}</h4>
                        <p><strong>Reasoning:</strong> {protocol.leveragePoint.reasoning}</p>
                        <h5 className="font-semibold text-slate-200 mt-4">Sequential Triggers:</h5>
                        <ul className="list-disc pl-5">
                            {protocol.leveragePoint.sequentialTriggers.map((trigger, i) => <li key={i}>{trigger}</li>)}
                        </ul>
                        <h5 className="font-semibold text-slate-200 mt-4">F. L. Rawson Retroactive Healing Script:</h5>
                        <blockquote className="border-l-4 border-[#c9a445] pl-4 italic bg-slate-900/50 py-2 my-2 whitespace-pre-wrap">{protocol.leveragePoint.rawsonTreatmentScript}</blockquote>
                    </Section>

                    <Section title="Identity Shift Protocol (Psycho-Cybernetics)">
                        <h4 className="text-lg font-semibold text-slate-100">Familiar Patterns to Release</h4>
                        <p>These are the unconscious habits that reinforce the old identity. Your first step is to become aware of them without judgment.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            {protocol.identityShiftProtocol.familiarPatterns.map((pattern, i) => <li key={i}>{pattern}</li>)}
                        </ul>

                        <h4 className="text-lg font-semibold text-slate-100 mt-6">New Identity-Building Actions</h4>
                        <p>Perform these actions to build the self-image of your healed identity. This is not 'faking it'; it is practicing the person you are becoming.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            {protocol.identityShiftProtocol.newBehaviors.map((behavior, i) => <li key={i}>{behavior}</li>)}
                        </ul>
                    </Section>

                     <Section title="Future Forecast & Vision">
                        <p>{protocol.futureForecast.vision}</p>
                        <h5 className="font-semibold text-slate-200 mt-4">Potential Gains from Resolution:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="bg-slate-900 p-4 rounded-md"><strong>Financial:</strong> {protocol.futureForecast.quantifiedGains.financial}</div>
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Physical:</strong> {protocol.futureForecast.quantifiedGains.physical}</div>
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Emotional:</strong> {protocol.futureForecast.quantifiedGains.emotional}</div>
                            <div className="bg-slate-900 p-4 rounded-md"><strong>Spiritual:</strong> {protocol.futureForecast.quantifiedGains.spiritual}</div>
                        </div>
                    </Section>
                    <p className="text-xs text-slate-500 text-center mt-8 italic">{protocol.disclaimer}</p>
                </div>
            )}
             <ConfirmationModal
                isOpen={isRegenerateConfirmOpen}
                onClose={() => setIsRegenerateConfirmOpen(false)}
                onConfirm={handleConfirmRegenerate}
                title="Regenerate Protocol"
                confirmText="Yes, Regenerate"
                confirmVariant="primary"
            >
                <p>Are you sure you want to regenerate the Self-Awareness Protocol? This will replace the current version with a new analysis from the AI.</p>
            </ConfirmationModal>
        </div>
    );
};

export default SelfAwareness;