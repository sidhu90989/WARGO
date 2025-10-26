import { useEffect, useMemo, useState } from 'react';
import { initSocket, getSocket, disconnectSocket, isSocketConnected } from '@shared/realtime/socketClient';

export function useSocket(userId: string | undefined, role: 'rider' | 'driver' | 'admin') {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const socket = initSocket(userId, role);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setConnected(isSocketConnected());
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      disconnectSocket();
    };
  }, [userId, role]);

  return useMemo(() => ({ socket: getSocket(), connected }), [connected]);
}
