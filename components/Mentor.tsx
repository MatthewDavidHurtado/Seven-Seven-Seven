import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AuthUser, MentorConfig, ReportData, SelfAwarenessProtocol, ChatMessage } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Button from './Button';
import SystemMessage from './SystemMessage';
import ProtocolBanner from './ProtocolBanner';
import { SparklesIcon, UploadIcon, MicrophoneIcon, SendIcon, DownloadIcon, TrashIcon } from '../constants';
import * as geminiService from '../services/geminiService';
import ConfirmationModal from './ConfirmationModal';

// Add SpeechRecognition types for browsers that support it under a webkit prefix
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  abort: () => void;
}

// Fix: Augment the window object to include SpeechRecognition and webkitAudioContext APIs for proper TypeScript type checking.
declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition; };
    webkitSpeechRecognition: { new(): SpeechRecognition; };
    webkitAudioContext: typeof AudioContext;
  }
}

// Helper functions for decoding and playing raw PCM audio data from the TTS API
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


// Function to parse mentor response for special tags
const parseMentorResponse = (text: string) => {
    const protocolStartRegex = /\[PROTOCOL_START:([^\]]+)\]/;
    const protocolEndRegex = /\[PROTOCOL_END\]/;
    const treatmentStartRegex = /\[TREATMENT_START:([^\]]+)\]/;
    const treatmentEndRegex = /\[TREATMENT_END\]/;

    const protocolStartMatch = text.match(protocolStartRegex);
    const treatmentStartMatch = text.match(treatmentStartRegex);

    const isProtocolEnd = protocolEndRegex.test(text);
    const isTreatmentEnd = treatmentEndRegex.test(text);

    const cleanText = text
        .replace(protocolStartRegex, '')
        .replace(protocolEndRegex, '')
        .replace(treatmentStartRegex, '')
        .replace(treatmentEndRegex, '')
        .trim();

    return {
        cleanText,
        protocolStarted: protocolStartMatch ? protocolStartMatch[1].replace(/_/g, ' ') : null,
        protocolEnded: isProtocolEnd,
        treatmentStarted: treatmentStartMatch ? treatmentStartMatch[1].replace(/_/g, ' ') : null,
        treatmentEnded: isTreatmentEnd,
    };
};

const formatContent = (content: string) => {
    // Basic markdown for bolding and lists
    let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\* (.*)/g, '<br/>&nbsp;&nbsp;&nbsp;• $1');
    return html.replace(/\n/g, '<br />');
};

interface MentorProps {
  user: AuthUser;
  mentorConfig: MentorConfig;
  reportData: ReportData | null;
  selfAwarenessProtocol: SelfAwarenessProtocol | null;
}

const Mentor: React.FC<MentorProps> = ({ user, mentorConfig, reportData, selfAwarenessProtocol }) => {
    const userKey = user.username;
    const [conversation, setConversation] = useLocalStorage<ChatMessage[]>(`gnmMentorConversation_${userKey}`, []);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeProtocol, setActiveProtocol] = useLocalStorage<string | null>(`gnmActiveProtocol_${userKey}`, null);
    const [activeTreatment, setActiveTreatment] = useLocalStorage<string | null>(`gnmActiveTreatment_${userKey}`, null);

    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useLocalStorage<boolean>(`gnmIsAudioEnabled_${userKey}`, true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    
    // Refs for audio playback
    const audioContextRef = useRef<AudioContext | null>(null);
    const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const stopAudio = useCallback(() => {
        if (currentAudioSourceRef.current) {
            try {
                currentAudioSourceRef.current.stop();
            } catch (e) {
                // Ignore if it's already stopped
            } finally {
                currentAudioSourceRef.current = null;
            }
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    // Initialize and clean up AudioContext
    useEffect(() => {
        if (!audioContextRef.current) {
            const AudioCtxt = window.AudioContext || window.webkitAudioContext;
            if (AudioCtxt) {
                // Per Gemini TTS docs, the output sample rate is 24000
                audioContextRef.current = new AudioCtxt({ sampleRate: 24000 });
            } else {
                console.warn("Web Audio API is not supported in this browser.");
            }
        }
        
        return () => {
            stopAudio();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, [stopAudio]);

    const playAudio = useCallback(async (base64Audio: string) => {
        if (!audioContextRef.current || !base64Audio) return;

        // Stop any currently playing audio
        stopAudio();
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioContextRef.current,
                24000, // sample rate for TTS
                1, // mono channel
            );

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            
            currentAudioSourceRef.current = source;
            source.onended = () => {
                if (currentAudioSourceRef.current === source) {
                    currentAudioSourceRef.current = null;
                }
            };

        } catch (error) {
            console.error("Failed to decode or play audio:", error);
            setError("Failed to play mentor's audio response.");
        }
    }, [stopAudio]);

    const handleListen = () => {
        // If we are currently listening, stop it. onend will handle cleanup.
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }
        
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            alert("Speech Recognition API is not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          setInput(prevInput => (prevInput ? prevInput + ' ' : '') + transcript);
        };
        
        recognition.onerror = (event) => {
          console.error("Speech recognition error", event.error);
           if (event.error !== 'no-speech') {
            alert(`Speech recognition error: ${event.error}. Please ensure microphone access has been granted.`);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          recognitionRef.current = null;
        };
        
        try {
            recognition.start();
        } catch(e) {
            console.error("Error starting speech recognition:", e);
            // Clean up if start fails
            setIsListening(false);
            recognitionRef.current = null;
        }
    };
    
    useEffect(() => {
        if (conversation.length === 0 && reportData) {
            setConversation([{
                role: 'system',
                content: `This is the start of your conversation with ${mentorConfig.name}. Your full Biological Code Blueprint has been loaded. You can ask questions, discuss your findings, or ask for guidance on specific conflicts.`
            }]);
        }
    }, [conversation.length, reportData, mentorConfig.name, setConversation]);

    const summarizeAndSave = useCallback(async (history: ChatMessage[]) => {
        if (history.length > 10) { // Only summarize if the conversation is getting long
            const summary = await geminiService.summarizeConversation(history, mentorConfig.name);
            const newHistory: ChatMessage[] = [
                { role: 'system', content: summary },
                ...history.slice(-8) // Keep the last few messages for context
            ];
            setConversation(newHistory);
        }
    }, [mentorConfig.name, setConversation]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading && reportData) {
            setError(null);
            const newUserMessage: ChatMessage = { role: 'user', content: input.trim() };
            const currentConversation = [...conversation, newUserMessage];
            setConversation(currentConversation);
            setInput('');
            setIsLoading(true);

            try {
                const responseText = await geminiService.getMentorResponse(reportData, currentConversation, mentorConfig, activeProtocol, activeTreatment, selfAwarenessProtocol);
                const { cleanText, protocolStarted, protocolEnded, treatmentStarted, treatmentEnded } = parseMentorResponse(responseText);
                
                if (protocolStarted) setActiveProtocol(protocolStarted);
                if (protocolEnded) setActiveProtocol(null);
                if (treatmentStarted) setActiveTreatment(treatmentStarted);
                if (treatmentEnded) setActiveTreatment(null);

                const newModelMessage: ChatMessage = { role: 'model', content: cleanText };
                const updatedConversation = [...currentConversation, newModelMessage];
                setConversation(updatedConversation);
                
                // Generate and play speech for the mentor's response
                if (isAudioEnabled && cleanText) {
                    const base64Audio = await geminiService.generateSpeech(cleanText, mentorConfig.personality);
                    if (base64Audio) {
                        await playAudio(base64Audio);
                    }
                }

                summarizeAndSave(updatedConversation);

            } catch (err) {
                const message = err instanceof Error ? err.message : "An unknown error occurred.";
                setError(message);
                const errorMessage: ChatMessage = { role: 'system', content: `Error from Mentor AI: ${message}` };
                setConversation(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const handleExitProtocol = () => {
        if (window.confirm("Are you sure you want to exit the current guided protocol?")) {
            const exitMessage: ChatMessage = { role: 'user', content: "exit protocol" };
            const currentConversation = [...conversation, exitMessage];
            setConversation(currentConversation);
            
            setActiveProtocol(null);
            setActiveTreatment(null);
            
            const systemMessage: ChatMessage = { role: 'system', content: "You have exited the guided protocol. You can now continue your general conversation with your mentor."};
            setConversation(prev => [...prev, systemMessage]);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result;
            if (typeof text !== 'string') {
                alert("Error reading file.");
                return;
            }
            // Simple parser for exported WhatsApp or plain text chats
            const messages: ChatMessage[] = text.split('\n').map(line => {
                // Heuristic to detect user vs model, can be refined
                if (line.toLowerCase().startsWith('user:')) {
                    return { role: 'user', content: line.substring(5).trim() };
                }
                if (line.toLowerCase().startsWith(`${mentorConfig.name.toLowerCase()}:`)) {
                    return { role: 'model', content: line.substring(mentorConfig.name.length + 1).trim() };
                }
                return null;
            }).filter((m): m is ChatMessage => m !== null);
            
            if (messages.length > 0) {
                 if (window.confirm("Importing this history will overwrite your current mentor conversation. Continue?")) {
                    setConversation(messages);
                    alert(`Successfully imported ${messages.length} messages.`);
                }
            } else {
                alert("Could not parse any messages from the file. Please ensure it is a plain text file with lines starting with 'User:' or your mentor's name.");
            }
        };
        reader.readAsText(file);
    };

    const handleDownload = () => {
        if (conversation.length <= 1) { // 1 for the initial system message
            alert("There is nothing to download.");
            return;
        }
        const conversationText = conversation
            .filter(msg => msg.role !== 'system') // Don't export system messages
            .map(msg => `${msg.role === 'model' ? mentorConfig.name : 'User'}: ${msg.content}`)
            .join('\n\n');
        
        const blob = new Blob([conversationText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `mentor_chat_${mentorConfig.name}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleClearConversation = () => {
        setIsClearConfirmOpen(true);
    };

    const handleConfirmClear = () => {
        stopAudio();
        setConversation([{
            role: 'system',
            content: `This is the start of your conversation with ${mentorConfig.name}. Your full Biological Code Blueprint has been loaded. You can ask questions, discuss your findings, or ask for guidance on specific conflicts.`
        }]);
        setActiveProtocol(null);
        setActiveTreatment(null);
        setIsClearConfirmOpen(false);
    };

    const handleAudioToggle = () => {
        const newAudioState = !isAudioEnabled;
        setIsAudioEnabled(newAudioState);
        if (!newAudioState) { // If turning audio OFF
            stopAudio();
        }
    };

    if (!reportData) {
        return (
            <div className="container mx-auto p-8 text-center">
                 <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 max-w-2xl mx-auto">
                    <SparklesIcon />
                    <h2 className="text-2xl font-bold text-[#c9a445] mt-4 mb-2">Your GNM Mentor is Ready</h2>
                    <p className="text-slate-400">Please generate a report in the Blueprint tab first. Your mentor uses this report to provide personalized guidance.</p>
                </div>
            </div>
        );
    }
    
    const activeProtocolName = activeProtocol || activeTreatment;
    const isTreating = activeTreatment === 'Mental Treatment';

    return (
        <div className="relative flex flex-col h-full">
            <header className="flex-shrink-0 p-3 bg-slate-900/50 backdrop-blur-sm z-10 border-b border-slate-700 flex flex-wrap justify-between items-center gap-2">
                <h1 className="text-xl font-brand text-[#c9a445]">{mentorConfig.name}: Your GNM Mentor</h1>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center gap-2">
                        <label htmlFor="audio-toggle" className="text-sm text-slate-300 font-medium">
                            Audio: {isAudioEnabled ? 'On' : 'Off'}
                        </label>
                        <button
                            id="audio-toggle"
                            role="switch"
                            aria-checked={isAudioEnabled}
                            onClick={handleAudioToggle}
                            className={`${isAudioEnabled ? 'bg-[#c9a445]' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#c9a445] focus:ring-offset-2 focus:ring-offset-slate-900`}
                        >
                            <span
                                aria-hidden="true"
                                className={`${isAudioEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                            />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="file" accept=".txt,.pdf" ref={importInputRef} className="hidden" onChange={handleFileUpload} />
                        <Button variant="secondary" size="sm" onClick={() => importInputRef.current?.click()}>
                            <UploadIcon />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleDownload}>
                            <DownloadIcon />
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleClearConversation}>
                            <TrashIcon />
                        </Button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 md:pb-60">
                <div className="max-w-4xl mx-auto space-y-4">
                    {activeProtocolName && (
                        <ProtocolBanner 
                            protocolName={activeProtocolName} 
                            onExit={handleExitProtocol}
                            isTreatment={!!activeTreatment}
                        />
                    )}

                    {conversation.map((msg, index) => {
                        if (msg.role === 'system') {
                            return <SystemMessage key={index}>{msg.content}</SystemMessage>;
                        }
                        const isModel = msg.role === 'model';
                        return (
                            <div key={index} className={`flex items-start gap-3 ${!isModel ? 'justify-end' : ''}`}>
                                {isModel && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[#c9a445] mt-2">
                                        <SparklesIcon />
                                    </div>
                                )}
                                <div className={`max-w-2xl p-3 rounded-lg shadow ${isModel ? 'bg-slate-900' : 'bg-[#c9a445]/20 text-slate-200'}`}>
                                    <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap font-sans text-sm" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                                </div>
                                {!isModel && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 mt-2 font-bold">
                                        U
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[#c9a445] mt-2">
                                 <SparklesIcon />
                             </div>
                             <div className="max-w-2xl p-3 rounded-lg shadow bg-slate-900">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <div className="w-2 h-2 bg-[#c9a445] rounded-full animate-pulse delay-0"></div>
                                    <div className="w-2 h-2 bg-[#c9a445] rounded-full animate-pulse delay-150"></div>
                                    <div className="w-2 h-2 bg-[#c9a445] rounded-full animate-pulse delay-300"></div>
                                </div>
                             </div>
                         </div>
                    )}
                    {error && <div className="text-red-400 text-sm bg-red-900/50 p-2 rounded-md">{error}</div>}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 md:left-64 right-0 p-4 bg-slate-900 border-t border-slate-800 z-49">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="relative flex-grow min-w-0">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Message your mentor..."
                            disabled={isLoading}
                            rows={1}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 pr-12 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445] disabled:opacity-50 resize-none leading-tight"
                            style={{ minHeight: '52px', maxHeight: '200px' }}
                        />
                        {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
                            <button
                                type="button"
                                onClick={handleListen}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${isListening ? 'text-red-500 bg-red-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                aria-label={isListening ? 'Stop recording' : 'Start recording'}
                            >
                                <MicrophoneIcon />
                            </button>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="flex-shrink-0 w-12 h-12 bg-[#c9a445] rounded-full flex items-center justify-center text-slate-900 hover:bg-[#b8943c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#c9a445]"
                        aria-label="Send message"
                    >
                        <SendIcon />
                    </button>
                </form>
            </div>
            <ConfirmationModal
                isOpen={isClearConfirmOpen}
                onClose={() => setIsClearConfirmOpen(false)}
                onConfirm={handleConfirmClear}
                title="Clear Conversation"
                confirmText="Yes, Clear History"
                confirmVariant="danger"
            >
                <p>Are you sure you want to permanently delete this conversation? This action cannot be undone.</p>
            </ConfirmationModal>
        </div>
    );
};

export default Mentor;