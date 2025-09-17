import React from 'react';

const VolumeControl: React.FC<{ isMuted: boolean; onToggle: () => void }> = ({ isMuted, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-8 left-8 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white shadow transition hover:bg-black/80 ${
        isMuted ? 'opacity-50' : 'opacity-100'
      }`}
      aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
    >
      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </svg>
    </button>
  );
};

export default VolumeControl;
