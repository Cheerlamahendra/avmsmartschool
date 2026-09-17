'use client';
import {useState, useMemo, useEffect} from 'react';
import {SimplePublicPage, getEventImage} from '@/components/public/PublicPage';
import {getCollection, defaultEvents} from '@/lib/storage';
import type {EventItem} from '@/types';

export default function Page(){
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [q, setQ] = useState('');

  useEffect(() => {
    const loaded = getCollection<EventItem>('events');
    if (loaded && loaded.length > 0) {
      setEvents(loaded);
    }
  }, []);

  const f = useMemo(() => events.filter(e => e.title.toLowerCase().includes(q.toLowerCase())), [events, q]);

  return (
    <SimplePublicPage title="Events" eyebrow="School Life">
      <div style={{maxWidth: 420, marginBottom: 24}}>
        <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search events" />
      </div>
      <div className="grid grid-3">
        {f.map(e => (
          <div className="card" key={e.id} style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <img alt={e.title} src={getEventImage(e)} style={{width: '100%', height: 190, objectFit: 'cover'}} />
            <div style={{padding: 20, display: 'flex', flexDirection: 'column', flex: 1}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <span className="badge badge-orange">{e.status}</span>
                <span className="muted" style={{fontSize: 13}}>{new Date(e.date).toLocaleDateString('en-IN')}</span>
              </div>
              <h3 style={{margin: '0 0 6px', fontSize: 18}}>{e.title}</h3>
              <p className="muted" style={{margin: '0 0 12px', fontSize: 14, flex: 1}}>{e.description}</p>
              <div className="muted" style={{fontSize: 13}}><strong>Time:</strong> {e.time} • <strong>Venue:</strong> {e.location}</div>
            </div>
          </div>
        ))}
      </div>
    </SimplePublicPage>
  );
}
