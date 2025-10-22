import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimelineData, ConflictEvent, InitialAnchor, AiAnalysis, ReportData, ChatMessage, AuthUser } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Header from './Header';
import InitialAnchorForm from './InitialAnchorForm';
import Timeline from './Timeline';
import EventFormModal from './EventFormModal';
import AIPanel from './AIPanel';
import Loader from './Loader';
import Report from './Report';
import InteractiveDiagnostician from './InteractiveDiagnostician';
import * as geminiService from '../services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@5.4.149/build/pdf.worker.mjs`;

const MAX_IMAGE_DIMENSION = 2048;

// Helper to resize an image element onto a canvas
const resizeImage = (img: HTMLImageElement): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    let { width, height } = img;

    if (width > height) {
        if (width > MAX_IMAGE_DIMENSION) {
            height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
            width = MAX_IMAGE_DIMENSION;
        }
    } else {
        if (height > MAX_IMAGE_DIMENSION) {
            width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
            height = MAX_IMAGE_DIMENSION;
        }
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Could not get canvas context for image resizing.");
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
};


const fileToGenerativeParts = async (file: File): Promise<{mimeType: string, data: string}[]> => {
    const fileType = file.type;

    // --- PDF Handler ---
    if (fileType === "application/pdf") {
        try {
            const fileBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
            const numPages = pdf.numPages;
            const parts = [];
            const maxPagesToProcess = Math.min(numPages, 10); // Increased limit slightly

            for (let i = 1; i <= maxPagesToProcess; i++) {
                try {
                    const page = await pdf.getPage(i);
                    // Use a lower scale (1.0) to conserve memory, which is a common failure point on mobile.
                    const viewport = page.getViewport({ scale: 1.0 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (!context) {
                        console.warn(`Could not get canvas context for PDF page ${i}`);
                        continue; // Skip this page if context fails
                    }
                    
                    const renderContext = {
                        canvas,
                        canvasContext: context,
                        viewport: viewport,
                    };
                    await page.render(renderContext).promise;
                    
                    // Convert to JPEG for consistency and smaller size
                    const base64Data = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                    parts.push({
                        mimeType: 'image/jpeg',
                        data: base64Data
                    });
                } catch (pageError) {
                    console.error(`Error processing PDF page ${i}:`, pageError);
                    // Continue to the next page instead of failing the whole upload
                }
            }
            if (parts.length === 0 && maxPagesToProcess > 0) {
                 throw new Error("Failed to process any pages from the PDF. The file might be corrupted or in an unsupported format.");
            }
            return parts;
        } catch (pdfError: any) {
            console.error("Error loading PDF document:", pdfError);
            if (pdfError.name === 'PasswordException') {
                throw new Error("The uploaded PDF is password-protected. Please provide a version without a password.");
            }
            throw new Error("Could not process the PDF file. It may be an unsupported format, corrupted, or password-protected. Please try again with a different file.");
        }
    }

    // --- Image Handler ---
    if (fileType.startsWith("image/")) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const resizedCanvas = resizeImage(img);
                        // Using JPEG for all images to standardize and reduce size
                        const base64Data = resizedCanvas.toDataURL('image/jpeg', 0.9).split(',')[1];
                        resolve([{
                            mimeType: 'image/jpeg',
                            data: base64Data
                        }]);
                    } catch (resizeError) {
                        reject(resizeError);
                    }
                };
                img.onerror = () => {
                    reject(new Error("The selected image file could not be loaded. It may be corrupted."));
                };
                if (event.target?.result) {
                    img.src = event.target.result as string;
                } else {
                    reject(new Error("FileReader failed to read the image file."));
                }
            };
            reader.onerror = () => {
                reject(new Error("An error occurred while reading the image file."));
            };
            reader.readAsDataURL(file);
        });
    }

    // --- Fallback for unsupported types ---
    throw new Error(`Unsupported file type: "${fileType}". Please upload a PDF or an image file (.jpg, .png, etc.).`);
};

interface BlueprintProps {
    user: AuthUser;
    reportData: ReportData | null;
    setReportData: (data: ReportData | null) => void;
}

function Blueprint({ user, reportData, setReportData }: BlueprintProps) {
  const userKey = user.username;
  const [timelineData, setTimelineData] = useLocalStorage<TimelineData>(`gnmTimelineData_${userKey}`, {
    initialAnchor: null,
    events: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ConflictEvent | null>(null);
  const [aiAnalysis, setAiAnalysis] = useLocalStorage<AiAnalysis | null>(`gnmAiAnalysis_${userKey}`, null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'timeline' | 'report'>('timeline');
  const [conversation, setConversation] = useLocalStorage<ChatMessage[]>(`gnmConversation_${userKey}`, []);


  useEffect(() => {
    // When timeline data changes, reset the conversation to avoid context mismatches
    if (conversation.length > 0) {
        setConversation([]);
    }
  }, [timelineData.initialAnchor?.date, timelineData.events.length]);

  const handleSetAnchor = (anchor: InitialAnchor) => {
    setTimelineData(prev => ({ ...prev, initialAnchor: anchor }));
  };

  const handleOpenModal = (event: ConflictEvent | null = null) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  const handleEventSubmit = async (eventData: Omit<ConflictEvent, 'id' | 'conflictType' | 'germLayer' | 'healingSymptoms' | 'gnmExplanation'>) => {
    setIsLoading(true);
    setLoadingText("Getting GNM Analysis...");
    setError(null);
    handleCloseModal();

    try {
      const gnmData = await geminiService.categorizeConflict(eventData);
      
      if (eventToEdit) {
        // Editing existing event
        const updatedEvent: ConflictEvent = { ...eventToEdit, ...eventData, ...gnmData };
        setTimelineData(prev => ({
          ...prev,
          events: prev.events.map(e => (e.id === eventToEdit.id ? updatedEvent : e)),
        }));
      } else {
        // Creating new event
        const newEvent: ConflictEvent = {
          id: new Date().toISOString(),
          ...eventData,
          ...gnmData,
        };
        setTimelineData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
      }
      setAiAnalysis(null); // Invalidate old analysis
      setReportData(null); // Invalidate old report
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = (id: string) => {
    if(window.confirm("Are you sure you want to delete this conflict? This action cannot be undone.")){
        setTimelineData(prev => ({...prev, events: prev.events.filter(e => e.id !== id)}));
        setAiAnalysis(null); // Invalidate old analysis
        setReportData(null); // Invalidate old report
    }
  };
  
  const handleAnalyzeTimeline = useCallback(async () => {
    if (!timelineData.initialAnchor || timelineData.events.length < 2) {
      setError("Please add at least two conflict events to analyze tracks.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      let currentEvents = timelineData.events;
      const uncategorizedEvents = currentEvents.filter(e => !e.gnmExplanation);

      if (uncategorizedEvents.length > 0) {
        setLoadingText(`Categorizing ${uncategorizedEvents.length} uncategorized event(s)...`);
        const updatedEvents = await Promise.all(
          currentEvents.map(async (event) => {
            if (!event.gnmExplanation) {
              try {
                const gnmData = await geminiService.categorizeConflict(event);
                return { ...event, ...gnmData };
              } catch (e) {
                console.error(`Failed to categorize event ID ${event.id}:`, e);
                return event; // Keep original event on failure
              }
            }
            return event;
          })
        );
        setTimelineData(prev => ({ ...prev, events: updatedEvents }));
        currentEvents = updatedEvents;
      }
      
      setLoadingText("Analyzing Tracks & Patterns...");
      const cycleLength = timelineData.initialAnchor.age;
      const tracks = await geminiService.analyzeTracks(currentEvents, cycleLength);
      const futurePrediction = await geminiService.predictFutureTriggers({tracks, events: currentEvents}, cycleLength);
      setAiAnalysis({ tracks, futurePrediction });
      setReportData(null); // Invalidate old report if timeline is re-analyzed
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  }, [timelineData.events, timelineData.initialAnchor, setTimelineData, setAiAnalysis, setReportData]);
  
  const handleGenerateReport = async () => {
    if (!aiAnalysis || !timelineData.initialAnchor) {
      setError("Please analyze the timeline first before generating a report.");
      return;
    }
    setIsLoading(true);
    setLoadingText("Generating Your Final Blueprint...");
    setError(null);
    try {
      const report = await geminiService.generateFullReport(timelineData, aiAnalysis);
      setReportData(report);
      setView('report');
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred during report generation.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = () => {
    const mentorConversationStr = window.localStorage.getItem(`gnmMentorConversation_${userKey}`);
    const mentorConversation = mentorConversationStr ? JSON.parse(mentorConversationStr) : [];

    const dataToExport = { 
        timelineData, 
        aiAnalysis, 
        reportData, 
        conversation, // diagnostician conversation
        mentorConversation
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `gnm_blueprint_${userKey}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string' || !result.trim()) {
                throw new Error("Could not read file content or file is empty.");
            }
            
            const trimmedResult = result.trim();

            // A valid blueprint export should be a JSON object.
            if (!trimmedResult.startsWith('{')) {
                if (trimmedResult.startsWith('%PDF-')) {
                    throw new Error("You've selected a PDF file. The 'Import' button is for loading a saved Blueprint (.json file). To upload a chat history from a PDF, please go to the 'Mentor' tab and use the 'Upload History' button.");
                }
                throw new Error("The selected file is not a valid GNM Blueprint (.json). If you are trying to upload a chat history (.txt or .pdf), please use the 'Upload History' button in the 'Mentor' tab.");
            }

            const parsedData = JSON.parse(trimmedResult);
            // Basic validation
            if (parsedData.timelineData?.initialAnchor && Array.isArray(parsedData.timelineData?.events)) {
                setTimelineData(parsedData.timelineData);
                setAiAnalysis(parsedData.aiAnalysis || null);
                setReportData(parsedData.reportData || null);
                setConversation(parsedData.conversation || []);
                
                // Directly set the mentor conversation in local storage for the current user
                window.localStorage.setItem(`gnmMentorConversation_${userKey}`, JSON.stringify(parsedData.mentorConversation || []));

                setView('timeline');
                alert('Blueprint data imported successfully!');
            } else {
                throw new Error("The selected file is not a valid GNM blueprint. Please export a new file and try again.");
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred during import.";
            setError(`Import failed: ${message}`);
        }
    };
    reader.onerror = () => {
        setError("An error occurred while reading the file.");
    }
    reader.readAsText(file);
    e.target.value = ''; // Reset input so the same file can be selected again
  };
  
 const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);
    let accumulatedData = JSON.parse(JSON.stringify(timelineData));

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setLoadingText(`Processing Document ${i + 1} of ${files.length}: ${file.name}`);
        const documentParts = await fileToGenerativeParts(file);
        
        setLoadingText(`AI is scanning ${file.name}...`);
        const mergedData = await geminiService.scanAndStructureTimeline(
          documentParts,
          // Pass existing data if an anchor exists, otherwise it's an initial scan
          accumulatedData.initialAnchor ? accumulatedData : null
        );
        accumulatedData = mergedData;
      }

      setLoadingText('Finalizing and analyzing the complete timeline...');
      const eventsToAnalyze = accumulatedData.events;
      const uncategorizedEvents = eventsToAnalyze.filter((event: ConflictEvent) => !event.gnmExplanation);
      let finalEvents = eventsToAnalyze;

      if (uncategorizedEvents.length > 0) {
        setLoadingText(`Categorizing ${uncategorizedEvents.length} new event(s)...`);
        const analyzedNewEvents = await Promise.all(
          eventsToAnalyze.map(async (event: ConflictEvent) => {
            if (!event.gnmExplanation) {
              try {
                const gnmData = await geminiService.categorizeConflict(event);
                return { ...event, ...gnmData };
              } catch (err) {
                console.error(`Failed to analyze scanned event for age ${event.age}:`, err);
                return event;
              }
            }
            return event;
          })
        );
        finalEvents = analyzedNewEvents;
      }
      
      const finalTimelineData = { ...accumulatedData, events: finalEvents };
      setTimelineData(finalTimelineData);
      setAiAnalysis(null);
      setReportData(null);
      setConversation([]);
      setView('timeline');

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during scanning. Please ensure your document is clear and not password protected.");
    } finally {
      setIsLoading(false);
    }
    e.target.value = ''; // Reset input
  };

  const handleDiagnosticianSubmit = async (query: string) => {
    if(!aiAnalysis) {
        setError("Please run an initial timeline analysis before using the diagnostician.");
        return;
    }
    const newUserMessage: ChatMessage = { role: 'user', content: query };
    setConversation(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setLoadingText("Thinking...");
    setError(null);

    try {
        const response = await geminiService.getDynamicInsight(timelineData, aiAnalysis, query);
        const newModelMessage: ChatMessage = { role: 'model', content: response };
        setConversation(prev => [...prev, newModelMessage]);
    } catch (err) {
        setError("The AI Diagnostician encountered an error. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const isGeneratingReport = isLoading && loadingText === "Generating Your Final Blueprint...";

  if (!timelineData.initialAnchor) {
    return (
        <div className="flex-grow flex items-center justify-center p-4">
            {isLoading ? <Loader text={loadingText}/> : <InitialAnchorForm onSubmit={handleSetAnchor} onScan={handleScan} />}
            {error && <div className="absolute bottom-4 left-4 bg-red-800 border border-red-600 text-white p-4 my-4 rounded-md" role="alert">{error}</div>}
        </div>
    );
  }

  return (
    <>
      <Header 
        onAddEvent={() => handleOpenModal()} 
        onAnalyze={handleAnalyzeTimeline}
        isAnalysisDisabled={timelineData.events.length < 2}
        onExport={handleExport}
        onImport={handleImport}
        onScan={handleScan}
        isReportAvailable={!!aiAnalysis}
        onGenerateReport={handleGenerateReport}
        view={view}
        onSetView={setView}
      />
      {isGeneratingReport && (
        <div className="py-8">
            <Loader text={loadingText} />
        </div>
      )}
      <div className="container mx-auto px-4 flex-grow">
        {error && <div className="bg-red-800 border border-red-600 text-white p-4 my-4 rounded-md" role="alert" onClick={() => setError(null)}>{error}</div>}
        
        {view === 'report' ? (
          <>
            {isLoading && !isGeneratingReport && <div className="my-4"><Loader text={loadingText}/></div>}
            <Report reportData={reportData} setReportData={setReportData} />
          </>
        ) : (
          <>
            <AIPanel analysis={aiAnalysis} />
            {isLoading && !isModalOpen && !isGeneratingReport && <div className="my-4"><Loader text={loadingText}/></div>}
            {aiAnalysis && (
              <InteractiveDiagnostician 
                conversation={conversation}
                onSubmit={handleDiagnosticianSubmit}
                isLoading={isLoading && loadingText === "Thinking..."}
              />
            )}
            <Timeline 
                anchor={timelineData.initialAnchor} 
                events={timelineData.events} 
                analysis={aiAnalysis}
                onEditEvent={handleOpenModal} 
                onDeleteEvent={handleDeleteEvent}
                cycleLength={timelineData.initialAnchor.age}
            />
            {timelineData.events.length === 0 && !isLoading && (
                <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold text-slate-300">Your Timeline is Ready</h2>
                    <p className="text-slate-400 mt-2">Click "Add Conflict" to start populating your GNM blueprint.</p>
                </div>
            )}
          </>
        )}
      </div>
      <EventFormModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleEventSubmit} 
        eventToEdit={eventToEdit}
      />
    </>
  );
}

export default Blueprint;