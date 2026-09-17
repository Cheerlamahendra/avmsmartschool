import {SimplePublicPage} from '@/components/public/PublicPage';
export default function Page(){
  return (
    <SimplePublicPage title="About AVMSmart School" eyebrow="Who We Are">
      <div className="grid grid-2">
        <div className="card">
          <h3>Vision</h3>
          <p className="muted">To create confident, curious and responsible learners who are prepared for a changing world.</p>
          <h3 style={{marginTop: 20}}>Mission</h3>
          <p className="muted">Deliver a balanced education through strong teaching, values, technology and opportunities for every student.</p>
        </div>
        <div className="card">
          <h3>Core Values</h3>
          {['Integrity','Respect','Curiosity','Discipline','Collaboration','Empathy'].map(v=>(
            <div className="list-row" key={v}>
              <span>{v}</span>
              <span className="badge badge-orange">AVM</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginTop: 24, padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'center'}}>
        <img
          src="/images/principal.png"
          alt="Principal Dr. Priya Sharma"
          style={{width: '100%', height: '100%', minHeight: 280, maxHeight: 380, objectFit: 'cover'}}
        />
        <div style={{padding: 28}}>
          <span className="badge badge-orange" style={{marginBottom: 10}}>School Leadership</span>
          <h2 style={{margin: '8px 0 14px', fontSize: 24}}>Principal's Message</h2>
          <blockquote style={{margin: '0 0 16px', fontSize: 15, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--muted)', borderLeft: '3px solid var(--primary)', paddingLeft: 14}}>
            “Every child deserves to be seen, supported and challenged. Our school culture is designed to help students discover what they can do and develop the habits to do it well.”
          </blockquote>
          <strong style={{display: 'block', fontSize: 16}}>Dr. Priya Sharma</strong>
          <div className="muted" style={{fontSize: 13, marginTop: 2}}>Principal, AVMSmart School</div>
        </div>
      </div>
    </SimplePublicPage>
  );
}
