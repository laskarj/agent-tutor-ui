import React from 'react';

type Props = {
  isRecording: boolean;
  onMicClick: () => void;
  onEndSession: () => void;
  micDisabled?: boolean;
};

const Controls: React.FC<Props> = ({ isRecording, onMicClick, onEndSession, micDisabled }) => {
  return (
    <div className="mb-14 flex justify-center gap-5">
      <button
        onClick={onMicClick}
        disabled={micDisabled}
        className={`flex h-[70px] w-[70px] items-center justify-center rounded-full text-white shadow transition-all duration-300 ${
          micDisabled
            ? 'bg-white/10 opacity-60'
            : isRecording
              ? 'animate-recording bg-red-500/30'
              : 'bg-white/20 hover:bg-white/30'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      >
        <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
      <button
        onClick={onEndSession}
        className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-base shadow backdrop-blur-md transition hover:bg-white/30"
      >
        End Session
      </button>
    </div>
  );
};

export default Controls;
