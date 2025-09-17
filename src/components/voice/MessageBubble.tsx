import React from 'react';
import type { Message } from './types';

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold ${
          message.isUser ? 'bg-red-300/80' : 'bg-white/30'
        }`}
      >
        {message.isUser ? (
          <span>A</span>
        ) : (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-6.5l-4.24 4.24m-6.36 0L1.64 5.64m16.72 12.72l-4.24-4.24m-6.36 0L1.64 18.36" />
          </svg>
        )}
      </div>
      <div className="max-w-[250px] rounded-2xl bg-white/15 px-4 py-3 text-[15px] leading-snug backdrop-blur-md">
        {message.content}
      </div>
    </div>
  );
};

export default MessageBubble;
