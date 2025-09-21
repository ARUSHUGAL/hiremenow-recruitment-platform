import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

let socket: any = null;

export const connectSocket = (token: string) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
    transports: ['websocket'],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;
