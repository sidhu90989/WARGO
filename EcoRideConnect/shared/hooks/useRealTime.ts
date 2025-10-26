import { useEffect } from 'react';
import { onEvent, offEvent, emitEvent, getSocket } from '@shared/realtime/socketClient';

export function useRealTime<T = any>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    onEvent(event, handler as any);
    return () => offEvent(event);
  }, [event, handler]);

  return { emit: emitEvent, socket: getSocket() };
}
