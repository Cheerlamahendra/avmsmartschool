'use client';
import {useState, useEffect} from 'react';
import Link from 'next/link';
import {ArrowRight, CheckCircle2, CalendarDays, MapPin} from 'lucide-react';
import {getCollection, getSettings, defaultEvents, getTeacherImage} from '@/lib/storage';
import type {EventItem, Notice, Teacher, AppSettings} from '@/types';
import {PublicLayout} from './SiteChrome';
import {SectionHeader, FeatureGrid, FacilitiesPreview, AcademicCards} from './Sections';

export function getEventImage(e: { title?: string; image?: string }): string {
  const t = (e?.title || '').toLowerCase();
  const img = e?.image || '';
  if (t.includes('sport') || t.includes('annual') || img.includes('photo-1579952363873')) return '/images/anuval%20sport%20day.png';
  if (t.includes('parent') || t.includes('teacher') || t.includes('meeting') || img.includes('photo-1529070538774')) return '/images/parents%20meeting.png';
  if (t.includes('science') || t.includes('exhibit') || t.includes('exbit') || img.includes('photo-1532094349884')) return '/images/science%20exbition.png';
  if (img && !img.includes('unsplash.com')) return img;
  return '/images/anuval%20sport%20day.png';
}

export function HomePage(){
  const [events, setEvents] = useState<EventItem[]>(defaultEvents);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [s, setSettingsState] = useState<AppSettings>({
    schoolName: 'AVMSmart School',
    schoolAddress: 'Kurnool, Andhra Pradesh, India',
    phone: '+91 90000 00000',
    email: 'info@avmsmartschool.edu',
    academicYear: '2026-27',
    principalName: 'Dr. Priya Sharma',
    website: 'https://avmsmart.in'
  });

  useEffect(() => {
    const ev = getCollection<EventItem>('events').filter(e=>e.status==='Upcoming').slice(0,3);
    if(ev && ev.length > 0) setEvents(ev);
    setNotices(getCollection<Notice>('notices').filter(n=>n.status==='Published').slice(0,3));
    setTeachers(getCollection<Teacher>('teachers').slice(0,4));
    setSettingsState(getSettings());
  }, []);

  return (
    <PublicLayout>
      {/* Hero Section: ONLY the full-width AVM Smart School image */}
      <section className="hero-banner" style={{width: '100%', overflow: 'hidden', lineHeight: 0, background: '#0f172a'}}>
        <img
          src="/images/avmsmart%20school%20image.png"
          alt="AVMSmart School"
          style={{width: '100%', height: 'auto', display: 'block', maxHeight: '850px', objectFit: 'cover'}}
        />
      </section>

      {/* Stats bar placed directly below the hero section */}
      <section style={{background: '#ffffff', borderBottom: '1px solid var(--border)', padding: '24px 0'}}>
        <div className="container">
          <div className="grid grid-4" style={{margin: 0}}>
            {['Classes 1–10', '20 Sections', '20+ Faculty', 'Student-Centered Learning'].map(x => (
              <div key={x} className="card" style={{
                padding: '16px 20px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                border: '1px solid #fed7aa',
                boxShadow: '0 4px 14px rgba(249, 115, 22, 0.08)'
              }}>
                <strong style={{fontSize: 16, color: '#9a3412', display: 'block'}}>{x}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="About School" title="A modern learning environment rooted in strong values" text={`${s.schoolName} combines a strong academic foundation with technology-enabled teaching, student safety and meaningful co-curricular experiences.`}/>
          <div className="grid grid-2">
            <div className="card">
              <h3>Our approach</h3>
              <p className="muted">We focus on curiosity, discipline, communication, problem solving and confidence through structured classroom learning and activities.</p>
              <div style={{marginTop:18}}>
                {['Student-centered learning','Safe and caring campus','Technology-enabled classrooms','Academic and co-curricular balance'].map(x=>(
                  <div className="list-row" key={x}>
                    <span>{x}</span>
                    <CheckCircle2 color="#f97316" size={18}/>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
              <img alt="Principal Dr. Priya Sharma" src="/images/principal.png" style={{width:'100%',height:240,objectFit:'cover'}}/>
              <div style={{padding:20}}>
                <span className="badge badge-orange" style={{marginBottom:8}}>Principal's Desk</span>
                <h3 style={{margin:'4px 0 6px',fontSize:18}}>Dr. Priya Sharma</h3>
                <p className="muted" style={{margin:0,fontSize:14,lineHeight:1.5}}>“Every child deserves to be seen, supported and challenged to develop strong habits and achieve their highest potential.”</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{background:'#fff7ed'}}>
        <div className="container">
          <SectionHeader eyebrow="Why Choose Us" title="Everything students need to grow"/>
          <FeatureGrid/>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Academics" title="Learning designed for every stage"/>
          <AcademicCards/>
        </div>
      </section>

      <section className="section" style={{background:'#fff'}}>
        <div className="container">
          <SectionHeader eyebrow="Facilities" title="Spaces that support learning and activity"/>
          <FacilitiesPreview/>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="What's Happening" title="Upcoming events"/>
          <div className="grid grid-3">
            {events.map(e=>(
              <div className="card" key={e.id} style={{padding:0,overflow:'hidden',display:'flex',flexDirection:'column'}}>
                <img alt={e.title} src={getEventImage(e)} style={{width:'100%',height:180,objectFit:'cover'}}/>
                <div style={{padding:18,display:'flex',flexDirection:'column',flex:1}}>
                  <h3 style={{margin:'0 0 8px',fontSize:18}}>{e.title}</h3>
                  <div className="muted" style={{fontSize:13,display:'flex',gap:5,alignItems:'center',marginBottom:8}}>
                    <CalendarDays size={14}/> {new Date(e.date).toLocaleDateString('en-IN')} • {e.time}
                  </div>
                  <p className="muted" style={{margin:'0 0 12px',fontSize:14,flex:1}}>{e.description}</p>
                  <div style={{display:'flex',gap:6,alignItems:'center',fontSize:13}}>
                    <MapPin size={14} color="#f97316"/> {e.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{background:'#111827',color:'#fff'}}>
        <div className="container">
          <div className="grid grid-2">
            <div>
              <div className="eyebrow">Latest Notices</div>
              <h2 className="section-title" style={{color:'#fff'}}>Stay informed</h2>
              {notices.map(n=>(
                <div className="notice" style={{marginBottom:10}} key={n.id}>
                  <strong>{n.title}</strong>
                  <p style={{margin:'6px 0',color:'#6b7280'}}>{n.description}</p>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:0,overflow:'hidden',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',alignItems:'stretch'}}>
              <img src="/images/admision.png" alt="AVMSmart School Admissions" style={{width:'100%',height:'100%',minHeight:220,objectFit:'cover'}}/>
              <div style={{padding:24,display:'flex',flexDirection:'column',justifyContent:'center'}}>
                <span className="badge badge-orange" style={{alignSelf:'flex-start',marginBottom:10}}>Admissions Open</span>
                <h2 style={{fontSize:20,margin:'0 0 8px',color:'#111827'}}>Start your child's journey with AVMSmart School.</h2>
                <p className="muted" style={{margin:'0 0 16px',fontSize:14}}>Contact the school office or submit an online enquiry for the next academic year.</p>
                <div>
                  <Link href="/admissions" className="btn btn-primary">Apply Now <ArrowRight size={17}/></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="Faculty" title="Experienced educators"/>
          <div className="grid grid-4">
            {teachers.map(t=>(
              <div className="card" key={t.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <div style={{width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', border: '3px solid #fed7aa', boxShadow: '0 4px 12px rgba(249,115,22,0.12)', marginBottom: 12, background: '#fff7ed', flexShrink: 0}}>
                  <img
                    src={getTeacherImage(t)}
                    alt={t.name}
                    style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block'}}
                  />
                </div>
                <h3 style={{margin: '0 0 4px', fontSize: 18, fontWeight: 800}}>{t.name}</h3>
                <p className="muted" style={{margin: 0, fontSize: 13}}>{t.designation} • {t.subjects.join(', ')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
export function SimplePublicPage({title,eyebrow,children}:{title:string;eyebrow?:string;children:React.ReactNode}){return <PublicLayout><section className="section"><div className="container"><SectionHeader eyebrow={eyebrow} title={title}/>{children}</div></section></PublicLayout>}
