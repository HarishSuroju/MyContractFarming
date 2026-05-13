import { io } from 'socket.io-client';

// Base URL without /api for Socket.IO
export const SOCKET_BASE_URL =
  (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '')) ||
  'http://localhost:5000';

// Create a singleton Socket.IO client for the app
export const socket = io(SOCKET_BASE_URL, {
  withCredentials: true,
  autoConnect: false,
});

export default socket;

