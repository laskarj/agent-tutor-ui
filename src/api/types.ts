export interface RoomCreateRequest {
  name: string;
  empty_timeout?: number | null;
  max_participants?: number | null;
  metadata?: string | null;
}

export interface RoomSchema {
  name: string;
  sid: string;
  creation_time: number;
  num_participants: number;
  metadata: string;
}

export interface RoomListSchema {
  rooms: RoomSchema[];
}

export interface RoomAccessToken {
  token: string;
  room_name: string;
  identity: string;
  livekit_url: string;
}

