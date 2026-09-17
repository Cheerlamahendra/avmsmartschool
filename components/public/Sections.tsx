import Link from 'next/link'; import {ArrowRight,BookOpen,ShieldCheck,Monitor,Users,FlaskConical,Library,Bus,Camera,HeartPulse,Trophy} from 'lucide-react';
export function SectionHeader({eyebrow,title,text}:{eyebrow?:string;title:string;text?:string}){return <div style={{maxWidth:760,marginBottom:32}}>{eyebrow&&<div className="eyebrow" style={{color:'#ea580c'}}>{eyebrow}</div>}<h2 className="section-title">{title}</h2>{text&&<p className="section-subtitle">{text}</p>}</div>}
const features=[['Experienced Faculty',Users],['Modern Education',BookOpen],['Student Safety',ShieldCheck],['Technology Enabled Learning',Monitor],['Extracurricular Activities',Trophy],['Strong Academic Foundation',BookOpen]] as const;
export function FeatureGrid(){return <div className="grid grid-3">{features.map(([t,I])=><div className="card" key={t}><I color="#f97316"/><h3>{t}</h3><p className="muted">A supportive learning experience designed around student growth and confidence.</p></div>)}</div>}
export const facilities = [
  {
    title: 'Smart Classrooms',
    icon: Monitor,
    image: '/images/avmsmart%20class%20room.png',
    description: 'Digitally enabled classrooms equipped with smart boards and multimedia learning tools.'
  },
  {
    title: 'Computer Lab',
    icon: Monitor,
    image: '/images/computer%20lab.png',
    description: 'Modern computer lab with individual workstations and guided computer education.'
  },
  {
    title: 'Science Lab',
    icon: FlaskConical,
    image: '/images/science%20lab.png',
    description: 'Hands-on physics, chemistry, and biology labs fostering practical inquiry.'
  },
  {
    title: 'Library',
    icon: Library,
    image: '/images/library.png',
    description: 'Curated selection of literature, reference materials, journals, and quiet reading.'
  },
  {
    title: 'Playground',
    icon: Trophy,
    image: '/images/playground.png',
    description: 'Spacious outdoor sports fields supporting athletics, team games, and physical fitness.'
  },
  {
    title: 'Transportation',
    icon: Bus,
    image: '/images/transport.png',
    description: 'Safe, punctual, GPS-enabled school buses with trained drivers and attendants.'
  },
  {
    title: 'CCTV & Security',
    icon: Camera,
    image: '/images/cctv.png',
    description: 'Round-the-clock surveillance, gated perimeter, and strict visitor monitoring.'
  },
  {
    title: 'Activity Rooms',
    icon: HeartPulse,
    image: '/images/activity%20room.png',
    description: 'Creative spaces dedicated to music, fine arts, crafts, and performing arts.'
  }
];

export function FacilitiesPreview(){
  return (
    <div className="grid grid-4">
      {facilities.map(f => (
        <div className="card" key={f.title} style={{padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
          <div style={{position: 'relative', width: '100%', height: 170, overflow: 'hidden', background: '#f3f4f6'}}>
            <img
              src={f.image}
              alt={f.title}
              style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
            />
          </div>
          <div style={{padding: '16px 18px', display: 'flex', flexDirection: 'column', flex: 1}}>
            <h3 style={{fontSize: 18, margin: '0 0 6px', fontWeight: 800}}>{f.title}</h3>
            <p className="muted" style={{margin: 0, fontSize: 13, lineHeight: 1.5}}>{f.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export function AcademicCards(){return <div className="grid grid-3">{[['Primary School','1st–5th','Foundational literacy, numeracy and curiosity.'],['Middle School','6th–8th','Concept building, projects and independent thinking.'],['High School','9th–10th','Exam readiness, deeper subject mastery and career awareness.']].map(([t,c,d])=><div className="card" key={t}><span className="badge badge-orange">{c}</span><h3>{t}</h3><p className="muted">{d}</p><Link href="/academics" style={{color:'#ea580c',fontWeight:800,display:'inline-flex',alignItems:'center',gap:6}}>Explore <ArrowRight size={15}/></Link></div>)}</div>}
