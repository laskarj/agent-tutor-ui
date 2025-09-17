import type { RoomAccessToken, RoomCreateRequest, RoomSchema } from './types';
import { API_BASE } from '../config';


export async function createRoom(body: RoomCreateRequest): Promise<RoomSchema> {
  const res = await fetch(`${API_BASE}/rooms/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create room (${res.status}): ${text}`);
  }
  return (await res.json()) as RoomSchema;
}


export async function requestRoomAccessToken(params: {
  roomName: string;
  identity: string;
}): Promise<RoomAccessToken> {
  const url = `${API_BASE}/rooms/${encodeURIComponent(params.roomName)}/tokens?identity=${encodeURIComponent(params.identity)}`;
  const res = await fetch(url, { method: 'POST' });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get access token (${res.status}): ${text}`);
  }
  return (await res.json()) as RoomAccessToken;
}
