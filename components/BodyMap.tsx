import React from 'react';

interface BodyMapProps {
  selectedLocation: string;
  onLocationSelect: (location: string) => void;
}

// A list of body parts with their corresponding SVG path IDs and friendly names.
const bodyParts = [
  { id: 'head', name: 'Head/Brain' },
  { id: 'eyes', name: 'Eyes' },
  { id: 'ears', name: 'Ears' },
  { id: 'nose', name: 'Nose/Sinuses' },
  { id: 'mouth', name: 'Mouth/Jaw/Teeth' },
  { id: 'neck', name: 'Neck/Throat/Larynx' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'chest', name: 'Chest/Heart/Lungs' },
  { id: 'upper-abdomen', name: 'Upper Abdomen/Stomach/Liver' },
  { id: 'lower-abdomen', name: 'Lower Abdomen/Intestines' },
  { id: 'pelvis', name: 'Pelvis/Reproductive Organs' },
  { id: 'upper-back', name: 'Upper Back' },
  { id: 'lower-back', name: 'Lower Back/Kidneys' },
  { id: 'left-arm', name: 'Left Arm/Hand' },
  { id: 'right-arm', name: 'Right Arm/Hand' },
  { id: 'left-leg', name: 'Left Leg/Foot' },
  { id: 'right-leg', name: 'Right Leg/Foot' },
  { id: 'skin', name: 'Skin (General)' },
];

const BodyMap: React.FC<BodyMapProps> = ({ selectedLocation, onLocationSelect }) => {
    
  const handlePartClick = (partName: string) => {
    onLocationSelect(partName);
  };
  
  // Basic SVG silhouette paths. In a real app, these would be more detailed.
  // Using simple shapes here for demonstration.
  const BodySilhouetteSVG = () => (
     <svg viewBox="0 0 200 400" className="w-full h-auto max-w-xs mx-auto">
        <title>Interactive Body Map</title>
        {/* Simplified paths for demonstration */}
        <g id="body-parts-group" className="stroke-slate-500 stroke-2 cursor-pointer">
            {/* Head */}
            <path id="head" d="M80 20 C60 20 50 40 50 60 S60 100 80 100 H120 C140 100 150 80 150 60 S140 20 120 20 Z" />
            {/* Torso */}
            <path id="chest" d="M70 105 L50 120 V 200 L70 210 H130 L150 200 V 120 L130 105 Z" />
            {/* Arms */}
            <path id="left-arm" d="M50 120 L30 150 L20 250 L40 255 L55 180 Z" />
            <path id="right-arm" d="M150 120 L170 150 L180 250 L160 255 L145 180 Z" />
            {/* Legs */}
            <path id="left-leg" d="M70 210 L50 300 L60 380 L80 380 L80 210 Z" />
            <path id="right-leg" d="M130 210 L150 300 L140 380 L120 380 L120 210 Z" />
        </g>

        {/* This is a simplified example. A production version would have more detailed paths and possibly separate front/back views */}
        {bodyParts.map(part => {
             const isSelected = selectedLocation === part.name;
             // Find a simple representative path for highlighting
             const pathId = bodyParts.find(p => p.name === part.name)?.id || 'head'; 
             
             // This is a bit of a hack for the demo. In a real SVG, each path would be tagged.
             let simplePath;
             if(part.name.includes("Head")) simplePath = "M100,60 a40,40 0 1,0 0,0.1";
             else if(part.name.includes("Arm")) simplePath = "M35,180 a20,80 0 1,0 0,0.1";
             else if(part.name.includes("Leg")) simplePath = "M65,300 a20,80 0 1,0 0,0.1";
             else simplePath = "M100,160 a40,60 0 1,0 0,0.1";


             return (
                 <path
                    key={part.name}
                    id={`clickable-${part.id}`}
                    d={document.getElementById(part.id)?.getAttribute('d') || simplePath}
                    className={`transition-all duration-200 ${isSelected ? 'fill-amber-400/80 stroke-amber-200' : 'fill-slate-700/50 hover:fill-slate-600/70'}`}
                    onClick={() => handlePartClick(part.name)}
                 >
                    <title>{part.name}</title>
                 </path>
             )
        })}
     </svg>
  );


  return (
    <div className="bg-slate-900 border border-slate-700 rounded-md p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="md:col-span-1 h-64 md:h-auto">
             <BodySilhouetteSVG />
        </div>
        <div className="md:col-span-2 max-h-64 md:max-h-full overflow-y-auto pr-2">
            <p className="text-sm text-slate-400 mb-2">Selected: <strong className="text-white">{selectedLocation || 'None'}</strong></p>
            <div className="flex flex-wrap gap-2">
                {bodyParts.map(part => (
                    <button
                        type="button"
                        key={part.name}
                        onClick={() => handlePartClick(part.name)}
                        className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-colors duration-200 ${selectedLocation === part.name ? 'bg-[#c9a445] text-slate-900' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                    >
                        {part.name}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BodyMap;