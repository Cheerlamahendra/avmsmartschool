'use client';
import {useMemo, useState, useEffect} from 'react';
import {SimplePublicPage} from '@/components/public/PublicPage';
import {getCollection, getTeacherImage} from '@/lib/storage';
import type {Teacher} from '@/types';

export default function Page(){
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    setTeachers(getCollection<Teacher>('teachers'));
  }, []);

  const filtered = useMemo(() => teachers.filter(t => `${t.name} ${t.subjects.join(' ')}`.toLowerCase().includes(q.toLowerCase())), [teachers, q]);

  return (
    <SimplePublicPage title="Faculty" eyebrow="Our Educators">
      <div style={{maxWidth: 450, marginBottom: 24}}>
        <input className="input" placeholder="Search teacher or subject" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="grid grid-4">
        {filtered.map(t => (
          <div className="card" key={t.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
            <div style={{width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fed7aa', boxShadow: '0 4px 12px rgba(249,115,22,0.12)', marginBottom: 14, background: '#fff7ed', flexShrink: 0}}>
              <img
                src={getTeacherImage(t)}
                alt={t.name}
                style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
              />
            </div>
            <h3 style={{margin: '0 0 4px', fontSize: 18, fontWeight: 800}}>{t.name}</h3>
            <p className="muted" style={{margin: '0 0 6px', fontSize: 13, fontWeight: 600, color: 'var(--primary-dark)'}}>{t.designation}</p>
            <p className="muted" style={{margin: '0 0 12px', fontSize: 13}}>{t.qualification} • {t.experience} yrs</p>
            <div style={{marginTop: 'auto'}}>
              <span className="badge badge-orange">{t.subjects.join(' • ')}</span>
            </div>
          </div>
        ))}
      </div>
    </SimplePublicPage>
  );
}
