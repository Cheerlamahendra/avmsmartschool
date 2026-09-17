'use client';
import { ReactNode, useEffect, useState } from 'react';
import { initializeDatabase } from '@/lib/storage';

export default function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      initializeDatabase();
    } catch (err) {
      console.error('Database initialization error:', err);
    } finally {
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f8fafc',
        color: '#1e293b'
      }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{
            width: 44,
            height: 44,
            background: '#ea580c',
            color: '#fff',
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            fontWeight: 800,
            marginBottom: 16
          }}>
            AV
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>AVMSmart School</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Initializing workspace & data...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

