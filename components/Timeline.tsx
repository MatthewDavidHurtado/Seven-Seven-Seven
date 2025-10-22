import React from 'react';
import { ConflictEvent, InitialAnchor, AiAnalysis, Track } from '../types';
import TimelineEvent from './TimelineEvent';

interface TimelineProps {
    anchor: InitialAnchor;
    events: ConflictEvent[];
    analysis: AiAnalysis | null;
    onEditEvent: (event: ConflictEvent) => void;
    onDeleteEvent: (id: string) => void;
    cycleLength: number;
}

const TimelineAnchorItem: React.FC<{anchor: InitialAnchor, isLeft: boolean, cycleLength: number}> = ({ anchor, isLeft, cycleLength }) => {
    const containerClasses = `mb-8 flex justify-between items-center w-full ${isLeft ? 'md:flex-row-reverse' : ''}`;
    const cardBorderStyle = isLeft ? `md:border-r-4 border-[#c9a445]` : `md:border-l-4 border-[#c9a445] border-l-4`;
    const cycleAge = cycleLength > 0 ? (anchor.age - 1) % cycleLength + 1 : anchor.age;

    return (
        <div className={containerClasses}>
             <div className="hidden md:block w-5/12"></div> {/* Spacer */}
             <div className="z-10 flex items-center order-1 bg-[#c9a445] shadow-xl w-8 h-8 rounded-full border-2 border-[#e7c87c]">
                <h1 className="mx-auto font-semibold text-sm text-slate-900">{anchor.age}</h1>
            </div>
            <div className={`order-1 bg-[#c9a445]/10 rounded-lg shadow-xl w-full md:w-5/12 px-6 py-4 ${cardBorderStyle}`}>
                <p className="text-sm font-bold text-[#e7c87c]">Independent Life Anchor</p>
                <time className="text-xs text-slate-300">{anchor.date}</time>
                <p className="text-sm text-slate-200 mt-2">{anchor.description}</p>
                 <p className="text-xs text-[#e7c87c] mt-1 font-semibold">Cycle Age: {cycleAge}</p>
            </div>
        </div>
    );
}

const CycleDivider: React.FC<{cycleNum: number, startAge: number, endAge: number}> = ({cycleNum, startAge, endAge}) => (
    <div className="my-8">
        <div className="relative text-center">
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-700" aria-hidden="true"></div>
            <span className="relative bg-[#0a192f] px-4 py-1 text-base font-bold text-slate-300 rounded-full border border-slate-700">
                Cycle {cycleNum} <span className="font-normal text-slate-400">(Ages {startAge + 1} - {endAge})</span>
            </span>
        </div>
    </div>
);

const Timeline: React.FC<TimelineProps> = ({ anchor, events, analysis, onEditEvent, onDeleteEvent, cycleLength }) => {
    const timelineItems = React.useMemo(() => {
        const items = [
            { itemType: 'anchor' as const, data: anchor },
            ...events.map(event => ({ itemType: 'event' as const, data: event }))
        ];
        items.sort((a, b) => a.data.age - b.data.age);
        return items;
    }, [anchor, events]);

    const findTrackForEvent = (eventId: string): Track | undefined => {
        return analysis?.tracks.find(track => track.relatedEventIds.includes(eventId));
    }
    
    let lastRenderedCycle = -1;

    return (
        <div className="container mx-auto w-full p-4 md:p-8">
            <div className="relative wrap">
                <div className="border-2-2 absolute border-opacity-20 border-slate-600 h-full border left-1/2 -translate-x-1/2"></div>
                
                {timelineItems.map((item, index) => {
                    const isLeft = index % 2 === 0;
                    const itemAge = item.data.age;
                    const currentCycleIndex = itemAge > 0 && cycleLength > 0 ? Math.floor((itemAge - 1) / cycleLength) : 0;

                    let cycleDivider = null;
                    if(currentCycleIndex > lastRenderedCycle) {
                        const cycleNum = currentCycleIndex + 1;
                        const startAge = currentCycleIndex * cycleLength;
                        const endAge = startAge + cycleLength;
                        // Only show divider after the first cycle begins
                        if (cycleNum > 1) {
                           cycleDivider = <CycleDivider key={`cycle-${cycleNum}`} cycleNum={cycleNum} startAge={startAge} endAge={endAge} />;
                        }
                        lastRenderedCycle = currentCycleIndex;
                    }

                    let eventComponent;
                    if (item.itemType === 'anchor') {
                        eventComponent = (
                             <TimelineAnchorItem 
                                key="anchor" 
                                anchor={item.data as InitialAnchor} 
                                isLeft={isLeft} 
                                cycleLength={cycleLength}
                            />
                        );
                    } else {
                        const event = item.data as ConflictEvent;
                        eventComponent = (
                            <TimelineEvent
                                key={event.id}
                                event={event}
                                onEdit={onEditEvent}
                                onDelete={onDeleteEvent}
                                isLeft={isLeft}
                                track={findTrackForEvent(event.id)}
                                cycleLength={cycleLength}
                            />
                        );
                    }
                    
                    return (
                        <React.Fragment key={item.itemType === 'event' ? (item.data as ConflictEvent).id : 'anchor'}>
                            {cycleDivider}
                            {eventComponent}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default Timeline;