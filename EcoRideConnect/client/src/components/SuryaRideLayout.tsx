import React from 'react';
// Local responsive helpers for Surya Ride layout
import '@/styles/suryaride-responsive.css';

export type Role = 'rider' | 'driver' | 'admin';

export interface SuryaRideLayoutProps {
  role: Role;
  header?: React.ReactNode;
  mapArea?: React.ReactNode; // primary map workspace
  bottomPanel?: React.ReactNode; // rider bottom sheet / driver control panel
  bottomNav?: React.ReactNode; // mobile bottom navigation bar
  sidebar?: React.ReactNode; // admin-only sidebar
  children?: React.ReactNode; // admin main content
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SuryaRideLayout
 *
 * Non-invasive, role-aware layout scaffold for Surya Ride.
 * This component does NOT wire itself into any page yet. Safe to ship.
 */
export default function SuryaRideLayout({
  role,
  header,
  mapArea,
  bottomPanel,
  bottomNav,
  sidebar,
  children,
  className,
  style,
}: SuryaRideLayoutProps) {
  if (role === 'admin') {
    return (
      <div className={['admin-layout', className].filter(Boolean).join(' ')} style={style}>
        {/* Sidebar */}
        <aside style={{ borderRight: '1px solid var(--border)', minWidth: 280 }}>
          {sidebar}
        </aside>
        {/* Main */}
        <main style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <header style={{ borderBottom: '1px solid var(--border)' }}>{header}</header>
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>{children}</div>
        </main>
      </div>
    );
  }

  if (role === 'driver') {
    return (
      <div className={['ecoride-container', className].filter(Boolean).join(' ')} style={style}>
        <header className="ecoride-header" style={{ borderBottom: '1px solid var(--border)' }}>{header}</header>
        <div className="map-container" style={{ position: 'relative' }}>
          {mapArea}
        </div>
        <div className="bottom-sheet" style={{ borderTop: '1px solid var(--border)' }}>
          {bottomPanel}
        </div>
        <nav className="ecoride-bottom-nav" style={{ position: 'sticky', bottom: 0, borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          {bottomNav}
        </nav>
      </div>
    );
  }

  // rider
  return (
    <div className={['ecoride-container', className].filter(Boolean).join(' ')} style={style}>
      <header className="ecoride-header" style={{ borderBottom: '1px solid var(--border)' }}>{header}</header>
      <div className="map-container" style={{ position: 'relative' }}>
        {mapArea}
      </div>
      <div className="bottom-sheet" style={{ borderTop: '1px solid var(--border)' }}>
        {bottomPanel}
      </div>
      <nav className="ecoride-bottom-nav" style={{ position: 'sticky', bottom: 0, borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
        {bottomNav}
      </nav>
    </div>
  );
}
