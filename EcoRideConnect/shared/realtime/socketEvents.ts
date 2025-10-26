export const SOCKET_EVENTS = {
  RIDER: {
    REQUEST_RIDE: 'ride:request',
    CANCEL_RIDE: 'ride:cancel',
    DRIVER_ASSIGNED: 'ride:driver_assigned',
    DRIVER_LOCATION: 'ride:driver_location',
    RIDE_STARTED: 'ride:started',
    RIDE_COMPLETED: 'ride:completed',
  },
  DRIVER: {
    NEW_RIDE_REQUEST: 'ride:request', // drivers receive this
    ACCEPT_RIDE: 'ride:accept',
    REJECT_RIDE: 'ride:reject',
    UPDATE_LOCATION: 'driver:location_update',
    RIDE_STARTED: 'ride:started',
    RIDE_COMPLETED: 'ride:completed',
    STATUS_CHANGED: 'driver:status_changed',
  },
  ADMIN: {
    ALL_RIDES_UPDATE: 'admin:active_rides',
    DRIVERS_LOCATION: 'admin:all_drivers',
    PLATFORM_METRICS: 'platform:metrics',
  },
} as const;

export type SocketEventGroups = typeof SOCKET_EVENTS;
