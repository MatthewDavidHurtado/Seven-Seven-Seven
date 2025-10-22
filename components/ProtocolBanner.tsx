import React from 'react';
import Button from './Button';

interface ProtocolBannerProps {
  protocolName: string;
  onExit: () => void;
}

const ProtocolBanner: React.FC<ProtocolBannerProps> = ({ protocolName, onExit }) => {
  return (
    <div className="p-3 bg-amber-900/50 text-amber-200 rounded-md mb-4 text-sm flex justify-between items-center border border-amber-700">
      <div>
        <p className="font-bold">GUIDED PROTOCOL ACTIVE</p>
        <p>Your mentor is guiding you through the '{protocolName}' resolution.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={onExit}>
        Exit Protocol
      </Button>
    </div>
  );
};

export default ProtocolBanner;
