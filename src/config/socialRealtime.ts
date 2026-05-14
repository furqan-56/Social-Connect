import {io, type Socket} from 'socket.io-client';

export const SOCIAL_SOCKET_URL = 'http://10.0.2.2:4000';

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCIAL_SOCKET_URL, {
    auth: {userId},
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    transports: ['websocket'],
  });

  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
