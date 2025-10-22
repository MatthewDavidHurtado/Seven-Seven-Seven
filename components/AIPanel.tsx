import React from 'react';
import { AiAnalysis } from '../types';
import { BrainCircuitIcon } from '../constants';

interface AIPanelProps {
  analysis: AiAnalysis | null;
}

const AIPanel: React.FC<AIPanelProps> = ({ analysis }) => {
  if (!analysis || (analysis.tracks.length === 0 && !analysis.futurePrediction)) {
    return (
        <div className="text-center py-10 text-slate-400">
            <p>Add at least two conflicts and click "Analyze Timeline" to generate your GNM Blueprint.</p>
        </div>
    );
  }

  return (
    <div className="bg-slate-800/80 rounded-lg p-6 my-8 border border-slate-700 shadow-lg">
      <h2 className="text-3xl font-bold text-[#c9a445] mb-4 flex items-center gap-3 font-brand tracking-wider">
        <div className="text-[#c9a445]"><BrainCircuitIcon /></div>
        Your GNM Blueprint
      </h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-200 border-b-2 border-[#c9a445] pb-2 mb-4">Identified Tracks</h3>
        {analysis.tracks.length > 0 ? (
          <div className="space-y-4">
            {analysis.tracks.map((track, index) => (
              <div key={index} className="bg-slate-900 p-4 rounded-md border-l-4 border-amber-400">
                <h4 className="text-lg font-bold text-amber-300">{track.theme}</h4>
                <p className="text-slate-300 mt-1">{track.description}</p>
                <p className="text-xs text-slate-400 mt-2">Related events: {track.relatedEventIds.length}</p>
                {track.affectedOrgans && track.affectedOrgans.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                      <h5 className="text-sm font-semibold text-slate-400 mb-2">Affected Biological Systems:</h5>
                      <div className="flex flex-wrap gap-2">
                          {track.affectedOrgans.map((organ, i) => (
                              <span key={i} className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full">{organ}</span>
                          ))}
                      </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No significant recurring tracks were identified from the provided events.</p>
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-200 border-b-2 border-[#c9a445] pb-2 mb-4">Future Awareness Blueprint</h3>
        <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap font-sans">
            {analysis.futurePrediction}
        </div>
      </div>
    </div>
  );
};

export default AIPanel;