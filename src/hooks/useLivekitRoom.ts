import { useCallback, useEffect, useRef, useState } from 'react';

type RoomHandle = {
  join: (url: string, token: string) => Promise<void>;
  leave: () => void;
  setMicEnabled: (enabled: boolean) => Promise<void>;
  setOutputMuted: (muted: boolean) => void;
  connected: boolean;
  micEnabled: boolean;
  remoteSpeaking: boolean;
};

export const useLivekitRoom = (opts?: {
  ignoreIdentity?: string;
  allowOnlyIdentity?: string;
  onData?: (payload: Uint8Array, participant?: any) => void;
  onRemoteAudioEl?: (el: HTMLAudioElement, participant?: any) => void;
}): RoomHandle => {
  const [connected, setConnected] = useState(false);
  const [micEnabled, setMicEnabledState] = useState(false);
  const [remoteSpeaking, setRemoteSpeaking] = useState(false);

  const roomRef = useRef<any | null>(null);
  const audioElsRef = useRef<HTMLAudioElement[]>([]);
  const outputMutedRef = useRef<boolean>(false);
  const ignoreIdentityRef = useRef<string | undefined>(opts?.ignoreIdentity);
  const allowOnlyIdentityRef = useRef<string | undefined>(opts?.allowOnlyIdentity);

  useEffect(() => {
    ignoreIdentityRef.current = opts?.ignoreIdentity;
    allowOnlyIdentityRef.current = opts?.allowOnlyIdentity;
  }, [opts?.ignoreIdentity, opts?.allowOnlyIdentity]);

  const cleanupAudio = () => {
    audioElsRef.current.forEach((el) => {
      try {
        el.pause();
        el.srcObject = null;
        el.remove();
      } catch {}
    });
    audioElsRef.current = [];
  };

  const leave = useCallback(() => {
    try {
      roomRef.current?.disconnect?.();
    } catch {}
    roomRef.current = null;
    cleanupAudio();
    setConnected(false);
    setMicEnabledState(false);
  }, []);

  const attachRemoteAudio = useCallback((track: any, participant?: any) => {
    try {
      const el: HTMLAudioElement = track.attach();
      el.autoplay = true;
      el.playsInline = true;
      el.muted = outputMutedRef.current;
      document.body.appendChild(el);
      audioElsRef.current.push(el);
      try { opts?.onRemoteAudioEl?.(el, participant); } catch {}
    } catch {}
  }, [opts?.onRemoteAudioEl]);

  const detachRemoteAudio = useCallback((track: any) => {
    try {
      track.detach()?.forEach((el: HTMLAudioElement) => {
        try {
          el.pause();
          el.srcObject = null;
          el.remove();
        } catch {}
      });
    } catch {}
  }, []);

  const join = useCallback(async (url: string, token: string) => {
    const lkGlobal: any = (window as any).livekitClient || (window as any).LivekitClient || (window as any).LiveKitClient;
    if (!lkGlobal) {
      throw new Error('LiveKit client not loaded. Ensure CDN script is included.');
    }

    const { Room, RoomEvent } = lkGlobal;
    const room = new Room({ adaptiveStream: true });

    room
      .on(RoomEvent.TrackSubscribed, (track: any, _pub: any, participant: any) => {
        if (participant?.isLocal) return;
        if (ignoreIdentityRef.current && participant?.identity === ignoreIdentityRef.current) return;
        if (allowOnlyIdentityRef.current && participant?.identity !== allowOnlyIdentityRef.current) return;
        if (track?.kind === 'audio') attachRemoteAudio(track, participant);
      })
      .on(RoomEvent.TrackUnsubscribed, (track: any, _pub: any, participant: any) => {
        if (participant?.isLocal) return;
        if (ignoreIdentityRef.current && participant?.identity === ignoreIdentityRef.current) return;
        if (allowOnlyIdentityRef.current && participant?.identity !== allowOnlyIdentityRef.current) return;
        if (track?.kind === 'audio') detachRemoteAudio(track);
      })
      .on(RoomEvent.Disconnected, () => {
        leave();
      })
      .on(RoomEvent.ActiveSpeakersChanged, (speakers: any[]) => {
        const speaking = (speakers || []).some((p: any) => {
          if (p?.isLocal) return false;
          if (ignoreIdentityRef.current && p?.identity === ignoreIdentityRef.current) return false;
          if (allowOnlyIdentityRef.current && p?.identity !== allowOnlyIdentityRef.current) return false;
          return true;
        });
        setRemoteSpeaking(speaking);
      })
      .on(RoomEvent.DataReceived, (payload: Uint8Array, participant: any) => {
        try { opts?.onData?.(payload, participant); } catch {}
      });

    await room.connect(url, token);
    roomRef.current = room;
    setConnected(true);
  }, [attachRemoteAudio, detachRemoteAudio, leave, opts?.onData]);

  const setMicEnabled = useCallback(async (enabled: boolean) => {
    const room = roomRef.current;
    if (!room) return;
    await room.localParticipant.setMicrophoneEnabled(Boolean(enabled));
    setMicEnabledState(Boolean(enabled));
  }, []);

  const setOutputMuted = useCallback((muted: boolean) => {
    outputMutedRef.current = Boolean(muted);
    audioElsRef.current.forEach((el) => (el.muted = outputMutedRef.current));
  }, []);

  useEffect(() => () => leave(), [leave]);

  return { join, leave, setMicEnabled, setOutputMuted, connected, micEnabled, remoteSpeaking };
};
