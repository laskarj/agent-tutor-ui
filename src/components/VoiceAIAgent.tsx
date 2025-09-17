import React, { useState, useEffect } from 'react';
import StatusIndicator from './voice/StatusIndicator';
import SessionHeader from './voice/SessionHeader';
import AgentVoiceIndicator from './voice/AgentVoiceIndicator';
import Timer from './voice/Timer';
import Controls from './voice/Controls';
import ChatArea from './voice/ChatArea';
import VolumeControl from './voice/VolumeControl';
import AgentSpectrum from './voice/AgentSpectrum';
import JoinButton from './voice/JoinButton';
import type { Message, Status } from './voice/types';
import { createRoom, requestRoomAccessToken } from '../api/client';
import { useLivekitRoom } from '../hooks/useLivekitRoom';
import { DEFAULT_ROOM, IDENTITY_PREFIX } from '../config';
import { parseIncomingData } from '../utils/messages';

const VoiceAIAgent: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(24);
  const [status, setStatus] = useState<Status>('ready');
  const [showStatus, setShowStatus] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [agentAudioEl, setAgentAudioEl] = useState<HTMLAudioElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: 'Is the car smoking or on fire?',
      isUser: true,
      timestamp: Date.now()
    },
    {
      id: 2,
      content: 'No smoke. Just...',
      isUser: false,
      timestamp: Date.now()
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (!isRecording) {
          startRecording();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRecording) {
          stopRecording();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRecording]);

  const [roomName] = useState<string>(DEFAULT_ROOM);
  const [identity] = useState<string>(() => `${IDENTITY_PREFIX}-${Math.random().toString(36).slice(2,7)}`);

  const { join, leave, setMicEnabled, setOutputMuted, connected, remoteSpeaking } = useLivekitRoom({
    ignoreIdentity: identity,
    onData: (payload, participant) => {
      const parsed = parseIncomingData(payload, participant, identity);
      if (parsed) addMessage(parsed.content, parsed.isUser);
    },
    onRemoteAudioEl: (el, participant) => {
      if (!participant?.isLocal) setAgentAudioEl((prev) => prev ?? el);
    }
  });

  const startRecording = () => {
    if (!joined) return;
    setIsRecording(true);
    setStatus('listening');
    setShowStatus(true);
    setMicEnabled(true).catch(() => {});
    addUserMessage('User is speaking…');
  };

  const stopRecording = () => {
    setIsRecording(false);
    setMicEnabled(false).catch(() => {});
    setShowStatus(false);
    setStatus('ready');
  };

  const handleMicClick = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now(),
      content,
      isUser,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (content: string) => addMessage(content, true);
  const addAIMessage = (content: string) => addMessage(content, false);

  const handleEndSession = () => {
    setShowStatus(true);
    setStatus('ready');
    setTimeout(() => {
      if (confirm('End training session?')) {
        setSessionTime(0);
        setMessages([]);
        setShowStatus(false);
        setIsRecording(false);
        if (connected) leave();
        setJoined(false);
      }
    }, 500);
  };

  const handleJoin = async (roomName: string, identity: string) => {
    try {
      setJoining(true);
      await createRoom({name: roomName})
      const token = await requestRoomAccessToken({ roomName, identity });
      await join(token.livekit_url, token.token);
      setJoined(true);
      addUserMessage(`Joined ${roomName} as ${identity}`);
    } catch (e) {
      console.log(e)
      alert((e as Error).message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    if (remoteSpeaking) {
      addAIMessage('Agent is speaking…');
    }
  }, [remoteSpeaking]);

  return (
    <div className="min-h-screen text-white overflow-hidden">
      <div className="relative mx-auto flex min-h-screen max-w-[400px] flex-col px-5 py-5">
        <StatusIndicator status={status} show={showStatus} />
        <SessionHeader />
        <AgentVoiceIndicator speaking={remoteSpeaking} />
        {agentAudioEl && (
          <div className="mt-2 flex justify-center">
            <AgentSpectrum audioEl={agentAudioEl} width={140} height={140} />
          </div>
        )}
        {!joined && (
          <JoinButton joining={joining} roomName={roomName} identity={identity} onJoin={handleJoin} />
        )}
        <Timer time={sessionTime} />
        <Controls
          isRecording={isRecording}
          onMicClick={handleMicClick}
          onEndSession={handleEndSession}
          micDisabled={!joined}
        />
        <ChatArea messages={messages} />
      </div>
      <VolumeControl
        isMuted={isMuted}
        onToggle={() => {
          const next = !isMuted;
          setIsMuted(next);
          setOutputMuted(next);
        }}
      />
    </div>
  );
};

export default VoiceAIAgent;
