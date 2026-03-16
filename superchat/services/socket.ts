import { io, Socket } from 'socket.io-client';

// Remplace par ton IP locale quand tu testes sur un vrai appareil
// ex: 'http://192.168.1.XX:3000'
const SERVER_URL = 'http://10.1.0.240:3000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
