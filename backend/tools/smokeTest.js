const axios = require('axios');
const { io } = require('socket.io-client');

const API = process.env.API_URL || 'http://localhost:5000';

async function waitForHealth(retries = 30, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await axios.get(`${API}/api/health`, { timeout: 2000 });
      if (res.status === 200) return true;
    } catch (err) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  return false;
}

(async () => {
  console.log('Smoke test: waiting for backend health...');
  const ok = await waitForHealth();
  if (!ok) {
    console.error('Health check failed - backend not responding');
    process.exit(2);
  }

  console.log('Health OK. Testing socket.io flows...');

  const socket = io(API, {
    transports: ['websocket'],
    autoConnect: false,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('message-delivered', (data) => {
    console.log('message-delivered received:', data);
  });

  socket.on('receive-message', (data) => {
    console.log('receive-message received:', data);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });

  try {
    socket.connect();

    await new Promise((r) => setTimeout(r, 600));

    // emit join and a test message
    const from = 'smoke-tester-1';
    const to = 'smoke-tester-2';

    console.log('Emitting join with userId', from);
    socket.emit('join', from);

    await new Promise((r) => setTimeout(r, 300));

    console.log('Emitting send-message');
    socket.emit('send-message', { to, from, content: 'hello from smoke test', messageId: 'msg-smoke-1' });

    // wait a bit to capture events
    await new Promise((r) => setTimeout(r, 2000));

    socket.close();
    console.log('Smoke test completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(3);
  }
})();
