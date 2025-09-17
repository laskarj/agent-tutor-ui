import React, { useEffect, useRef } from 'react';
import type { Message } from './types';
import MessageBubble from './MessageBubble';

const ChatArea: React.FC<{ messages: Message[] }> = ({ messages }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);

  return (
    <div ref={ref} className="chat-area flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-6">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
};

export default ChatArea;
