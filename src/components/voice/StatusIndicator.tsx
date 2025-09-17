import React from 'react';
import type { Status } from './types';

const textFor = (status: Status) => {
  switch (status) {
    case 'listening': return 'Listening...';
    case 'thinking': return 'Thinking...';
    case 'speaking': return 'Speaking...';
    default: return 'Ready';
  }
};

const bgFor = (status: Status) => {
  switch (status) {
    case 'listening': return 'bg-emerald-400/30';
    case 'thinking': return 'bg-yellow-300/30';
    case 'speaking': return 'bg-blue-400/30';
    default: return 'bg-white/20';
  }
};

const StatusIndicator: React.FC<{ status: Status; show: boolean }> = ({ status, show }) => {
  return (
    <div
      className={`absolute left-1/2 top-5 -translate-x-1/2 rounded-full px-4 py-2 text-sm backdrop-blur-md transition-opacity duration-300 ${bgFor(status)} ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      {textFor(status)}
    </div>
  );
};

export default StatusIndicator;
