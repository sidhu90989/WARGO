type Callback<T = any> = (data: T) => void;

class EventBus {
  private events: Record<string, Set<Callback>> = {};

  emit<T = any>(event: string, data: T) {
    if (!this.events[event]) return;
    this.events[event].forEach((cb) => cb(data));
  }

  on<T = any>(event: string, callback: Callback<T>) {
    if (!this.events[event]) this.events[event] = new Set();
    this.events[event].add(callback as Callback);
    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: Callback<T>) {
    this.events[event]?.delete(callback as Callback);
  }

  clear(event?: string) {
    if (event) delete this.events[event];
    else this.events = {};
  }
}

export const eventBus = new EventBus();
export default eventBus;
