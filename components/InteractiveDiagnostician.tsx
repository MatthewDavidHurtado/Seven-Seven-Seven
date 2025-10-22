import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Button from './Button';
import { SparklesIcon } from '../constants';

interface InteractiveDiagnosticianProps {
  conversation: ChatMessage[];
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const InteractiveDiagnostician: React.FC<InteractiveDiagnosticianProps> = ({ conversation, onSubmit, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [conversation]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSubmit(input.trim());
            setInput('');
        }
    };
    
    const formatContent = (content: string) => {
        // Basic markdown for bolding and lists
        let html = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n(\s*)\* (.*)/g, '<br/>&nbsp;&nbsp;&nbsp;• $2'); // List items
        return html.replace(/\n/g, '<br />');
    };

    return (
        <div className="my-8 bg-slate-800/80 rounded-lg p-6 border border-slate-700 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2 font-brand tracking-wider">
                <SparklesIcon />
                Live GNM Insight Diagnostician
            </h3>
            <div className="max-h-96 overflow-y-auto pr-2 mb-4 space-y-4">
                {conversation.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[#c9a445] mt-2">
                                <SparklesIcon />
                            </div>
                        )}
                        <div className={`max-w-2xl p-3 rounded-lg shadow ${msg.role === 'model' ? 'bg-slate-900' : 'bg-[#c9a445]/20 text-slate-200'}`}>
                             <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap font-sans text-sm" dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />
                        </div>
                         {msg.role === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 mt-2 font-bold">
                                U
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && conversation[conversation.length - 1]?.role === 'user' && (
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
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a current symptom or situation..."
                    disabled={isLoading}
                    className="flex-grow bg-slate-900 border border-slate-700 rounded-md p-2 text-slate-200 focus:ring-2 focus:ring-[#c9a445] focus:border-[#c9a445] disabled:opacity-50"
                />
                <Button type="submit" disabled={isLoading}>Send</Button>
            </form>
        </div>
    );
};

export default InteractiveDiagnostician;
