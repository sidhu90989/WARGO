import React from 'react';

export function RideStatus({ status }: { status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' }) {
  const label = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  }[status];
  return <span className="text-sm text-muted-foreground">{label}</span>;
}

export default RideStatus;
