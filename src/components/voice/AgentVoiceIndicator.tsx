import React from 'react';

export const AgentVoiceIndicator: React.FC<{ speaking: boolean } > = ({ speaking }) => {
  return (
    <div className="fixed top-3 right-3 z-10" title={speaking ? 'Agent speaking' : 'Agent idle'}>
      <div className={`h-3 w-3 rounded-full ${speaking ? 'bg-green-400 animate-ping' : 'bg-white/40'}`}></div>
    </div>
  );
};

export default AgentVoiceIndicator;

