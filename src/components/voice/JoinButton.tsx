import React from 'react';

type Props = {
  joining: boolean;
  roomName: string;
  identity: string;
  onJoin: (roomName: string, identity: string) => void | Promise<void>;
};

const JoinButton: React.FC<Props> = ({ joining, roomName, identity, onJoin }) => {
  return (
    <div className="mt-10 mb-8 flex flex-col gap-3 rounded-xl bg-black/20 p-4 backdrop-blur">
      <div className="text-sm opacity-80">Join a session</div>
      <button
        className="mt-1 inline-flex items-center justify-center rounded-md bg-white/20 px-4 py-2 text-sm hover:bg-white/30 disabled:opacity-50"
        disabled={joining}
        onClick={() => onJoin(roomName, identity)}
      >
        {joining ? 'Joining…' : `Join ${roomName} as ${identity}`}
      </button>
    </div>
  );
};

export default JoinButton;

