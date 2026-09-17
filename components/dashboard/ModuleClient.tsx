'use client';
import {useMemo,useState,useEffect} from 'react';
import {Plus,Search,Download,Trash2,Edit3,Save,RotateCcw,Printer,FileText} from 'lucide-react';
import DashboardLayout from './DashboardLayout';
import {currentUser,getCollection,getOne,upsert,remove,resetDatabase,getSettings,setSettings,ensureStudentFees} from '@/lib/storage';
import {attendancePercent,calcFeeStatus,csvDownload,formatDate,gradeFor} from '@/lib/utils';
import type {Role,Student,Teacher,SchoolClass,Attendance,AttendanceStatus,ClassActivity,Assignment,AssignmentSubmission,Result,Fee,Notice,EventItem,Examination,Parent,AppSettings} from '@/types';
import {useToast} from '@/components/Toast';

interface ReceiptData {
  receiptNo: string;
  studentName: string;
  admissionNumber: string;
  classId: string;
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  paidNow?: number;
  balance: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
}

function generateReceiptHtml(r: ReceiptData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Receipt - ${r.receiptNo} - ${r.studentName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
    body { background: #f8fafc; color: #1e293b; padding: 30px 16px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    .receipt-box { width: 100%; max-width: 680px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 24px; position: relative; }
    .logo-badge { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; background: #ea580c; color: #ffffff; font-size: 20px; font-weight: 800; border-radius: 10px; margin-bottom: 8px; }
    .school-title { font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; margin-bottom: 4px; }
    .school-sub { font-size: 12px; color: #64748b; line-height: 1.5; }
    .receipt-title { display: inline-block; margin-top: 14px; padding: 4px 16px; background: #fff7ed; color: #ea580c; font-weight: 700; font-size: 13px; border-radius: 9999px; border: 1px solid #fed7aa; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: #f8fafc; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; font-size: 13px; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .meta-val { font-weight: 600; color: #0f172a; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table th { background: #f1f5f9; color: #475569; text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
    .table td { padding: 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .summary-box { margin-left: auto; width: 280px; margin-bottom: 28px; font-size: 13px; }
    .summary-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
    .summary-row.total { font-weight: 800; font-size: 15px; border-bottom: 2px solid #0f172a; border-top: 2px solid #0f172a; margin-top: 6px; padding: 8px 0; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
    .status-paid { background: #dcfce7; color: #15803d; }
    .status-partial { background: #fef3c7; color: #b45309; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 24px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #94a3b8; }
    .signature-area { text-align: center; }
    .signature-line { width: 160px; border-top: 1px solid #475569; margin-bottom: 6px; }
    .actions-bar { margin-top: 20px; display: flex; gap: 12px; justify-content: center; }
    .btn { cursor: pointer; padding: 10px 20px; font-size: 13px; font-weight: 600; border-radius: 8px; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .btn-primary { background: #ea580c; color: #ffffff; }
    .btn-primary:hover { background: #c2410c; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .receipt-box { border: none; box-shadow: none; padding: 20px; max-width: 100%; }
      .actions-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div class="logo-badge">AV</div>
      <div class="school-title">AVM SMART SCHOOL</div>
      <div class="school-sub">
        Affiliated to CBSE Board • Affiliation No. 3630123<br/>
        Road No. 12, Banjara Hills, Hyderabad, Telangana - 500034<br/>
        Phone: +91 98765 43210 | Email: accounts@avmsmartschool.edu.in
      </div>
      <div><span class="receipt-title">Official Fee Payment Receipt</span></div>
    </div>

    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Receipt Number</span>
        <span class="meta-val">${r.receiptNo}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Date of Payment</span>
        <span class="meta-val">${r.paymentDate}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Student Name</span>
        <span class="meta-val">${r.studentName}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Admission Number</span>
        <span class="meta-val">${r.admissionNumber}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Class & Section</span>
        <span class="meta-val">Class ${r.classId}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Payment Mode</span>
        <span class="meta-val">${r.paymentMethod}</span>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Particulars / Fee Category</th>
          <th>Academic Year</th>
          <th style="text-align:right">Total Fee</th>
          <th style="text-align:right">Amount Paid</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${r.feeType}</strong><br/><span style="color:#64748b;font-size:11px">Annual enrollment & facilities</span></td>
          <td>2026-27</td>
          <td style="text-align:right">₹${r.totalAmount.toLocaleString('en-IN')}</td>
          <td style="text-align:right;font-weight:700;color:#15803d">₹${(r.paidNow || r.paidAmount).toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row">
        <span>Total Fee:</span>
        <span>₹${r.totalAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>Total Paid to Date:</span>
        <span style="color:#15803d;font-weight:600">₹${r.paidAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>Remaining Balance:</span>
        <span style="color:${r.balance > 0 ? '#b91c1c' : '#15803d'};font-weight:700">₹${r.balance.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row total">
        <span>Status:</span>
        <span class="status-badge ${r.status === 'Paid' ? 'status-paid' : 'status-partial'}">${r.status.toUpperCase()}</span>
      </div>
    </div>

    <div class="footer">
      <div>
        <p>• Computer generated receipt, no physical signature required.</p>
        <p>• Thank you for your payment towards student education.</p>
      </div>
      <div class="signature-area">
        <div class="signature-line"></div>
        <span>Authorized Accounts Officer</span>
      </div>
    </div>
  </div>

  <div class="actions-bar">
    <button class="btn btn-primary" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`;
}

function ReceiptModal({receipt, onClose}:{receipt:ReceiptData; onClose:()=>void}){
  const printWindow = () => {
    const w = window.open('', '_blank');
    if (!w) {
      window.print();
      return;
    }
    w.document.write(generateReceiptHtml(receipt));
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 250);
  };

  const downloadFile = () => {
    const html = generateReceiptHtml(receipt);
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${receipt.receiptNo}-${receipt.studentName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{maxWidth:600,padding:24}}>
        <div className="topline" style={{borderBottom:'1px solid var(--border)',paddingBottom:12,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,background:'var(--primary)',color:'#fff',borderRadius:8,display:'grid',placeItems:'center',fontWeight:800}}>AV</div>
            <div>
              <h2 style={{margin:0,fontSize:18}}>Fee Payment Receipt</h2>
              <span className="muted" style={{fontSize:12}}>Receipt No: <strong>{receipt.receiptNo}</strong></span>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div style={{background:'#f8fafc',borderRadius:10,padding:14,marginBottom:16,border:'1px solid #e2e8f0',fontSize:13}}>
          <div className="grid grid-2" style={{gap:8}}>
            <div><span className="muted">Student:</span> <strong>{receipt.studentName}</strong></div>
            <div><span className="muted">Admission No:</span> <strong>{receipt.admissionNumber}</strong></div>
            <div><span className="muted">Class & Section:</span> <strong>Class {receipt.classId}</strong></div>
            <div><span className="muted">Payment Date:</span> <strong>{receipt.paymentDate}</strong></div>
            <div><span className="muted">Category:</span> <strong>{receipt.feeType}</strong></div>
            <div><span className="muted">Payment Mode:</span> <strong>{receipt.paymentMethod}</strong></div>
          </div>
        </div>

        <div style={{marginBottom:18}}>
          <table className="table" style={{fontSize:13}}>
            <thead>
              <tr>
                <th>Particulars</th>
                <th style={{textAlign:'right'}}>Total Fee</th>
                <th style={{textAlign:'right'}}>Paid</th>
                <th style={{textAlign:'right'}}>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{receipt.feeType}</strong></td>
                <td style={{textAlign:'right'}}>₹{receipt.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{textAlign:'right',color:'#15803d',fontWeight:700}}>₹{receipt.paidAmount.toLocaleString('en-IN')}</td>
                <td style={{textAlign:'right',color:receipt.balance > 0 ? '#b91c1c' : '#15803d',fontWeight:700}}>₹{receipt.balance.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10,padding:'8px 12px',background:'#f0fdf4',borderRadius:8,border:'1px solid #bbf7d0'}}>
            <span style={{fontSize:13,fontWeight:600,color:'#166534'}}>Payment Status</span>
            <Badge status={receipt.status}>{receipt.status.toUpperCase()}</Badge>
          </div>
        </div>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,paddingTop:12,borderTop:'1px solid var(--border)'}}>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost" onClick={downloadFile}>
              <Download size={15}/> Download (.html)
            </button>
            <button className="btn btn-primary" onClick={printWindow}>
              <Printer size={15}/> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({title,subtitle,action}:{title:string;subtitle?:string;action?:React.ReactNode}){return <div className="topline" style={{marginBottom:20}}><div><h1 style={{margin:0,fontSize:28}}>{title}</h1>{subtitle&&<p className="muted" style={{margin:'6px 0 0'}}>{subtitle}</p>}</div>{action}</div>}
function Badge({children,status}:{children:React.ReactNode;status?:string}){const c=['Absent','Overdue','Urgent'].includes(status||'')?'badge-red':['Present','Paid','Completed'].includes(status||'')?'badge-green':'badge-orange';return <span className={`badge ${c}`}>{children}</span>}
function Field({label,value,onChange,type='text'}:{label:string;value:string;onChange:(v:string)=>void;type?:string}){return <div className="field"><label className="label">{label}</label><input className="input" type={type} value={value} onChange={e=>onChange(e.target.value)}/></div>}
function Modal({title,children,onClose,onSave}:{title:string;children:React.ReactNode;onClose:()=>void;onSave:()=>void}){return <div className="modal-backdrop"><div className="modal"><div className="topline"><h2 style={{margin:0}}>{title}</h2><button className="btn btn-ghost" onClick={onClose}>Close</button></div>{children}<div style={{display:'flex',justifyContent:'flex-end',gap:10,marginTop:10}}><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={onSave}><Save size={15}/> Save</button></div></div></div>}

function Dashboard({role}:{role:Role}){
  const u=currentUser(role)!;
  const students=getCollection<Student>('students'),
        teachers=getCollection<Teacher>('teachers'),
        classes=getCollection<SchoolClass>('classes'),
        atts=getCollection<Attendance>('attendance'),
        fees=getCollection<Fee>('fees'),
        assignments=getCollection<Assignment>('assignments'),
        events=getCollection<EventItem>('events'),
        notices=getCollection<Notice>('notices'),
        results=getCollection<Result>('results');

  const student=role==='student'?getOne<Student>('students',u.entityId):null;
  const parent=role==='parent'?getOne<Parent>('parents',u.entityId):null;
  const teacher=role==='teacher'?getOne<Teacher>('teachers',u.entityId):null;

  const myChildren = useMemo(()=>parent ? students.filter(s=>parent.childIds.includes(s.id)) : [], [parent, students]);
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const teacherStudents = useMemo(()=>teacher ? students.filter(s=>teacher.assignedClassIds.includes(s.classId)) : [], [teacher, students]);

  const visible = useMemo(()=>{
    if(role==='admin') return students;
    if(role==='teacher') return teacherStudents;
    if(role==='student') return student ? [student] : [];
    if(role==='parent'){
      return selectedChild === 'all' ? myChildren : myChildren.filter(s=>s.id===selectedChild);
    }
    return [];
  },[role, students, teacherStudents, student, selectedChild, myChildren]);

  const a = atts.filter(x=>visible.some(s=>s.id===x.studentId));
  const f = fees.filter(x=>visible.some(s=>s.id===x.studentId));
  const ass = assignments.filter(x=>visible.some(s=>s.classId===x.classId));

  const cardData = role==='admin'
    ? [
        ['Students',students.length],
        ['Teachers',teachers.length],
        ['Sections',classes.length],
        ['Fee Balance',`₹${f.reduce((n,x)=>n+x.balance,0).toLocaleString('en-IN')}`],
        ['Attendance',`${attendancePercent(a)}%`],
        ['Assignments',assignments.length],
        ['Events',events.length],
        ['Notices',notices.length]
      ]
    : role==='teacher'
    ? [
        ['Assigned Classes',teacher?.assignedClassIds.length||0],
        ['Students',visible.length],
        ['Attendance',`${attendancePercent(a)}%`],
        ['Assignments',ass.length]
      ]
    : role==='student'
    ? [
        ['Attendance',`${attendancePercent(a)}%`],
        ['Assignments',ass.length],
        ['Results',results.filter(r=>r.studentId===u.entityId).length],
        ['Events',events.length]
      ]
    : [
        ['Children', myChildren.length],
        ['Attendance',`${attendancePercent(a)}%`],
        ['Fee Balance',`₹${f.reduce((n,x)=>n+x.balance,0).toLocaleString('en-IN')}`],
        ['Assignments',ass.length]
      ];

  return (
    <>
      <Header title={`Welcome, ${u.name.split(' ')[0]}`} subtitle="Your AVMSmart School workspace at a glance."/>

      {role==='parent' && parent && (
        <div className="card" style={{marginBottom:18}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:14}}>
            <div>
              <div className="label" style={{margin:0,fontSize:14,fontWeight:700,color:'var(--foreground)'}}>Enrolled Children ({myChildren.length})</div>
              <div className="muted" style={{fontSize:12}}>Filter dashboard stats or click a child to focus records:</div>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button 
                type="button"
                className={`btn ${selectedChild === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{padding:'6px 14px',fontSize:13}}
                onClick={()=>setSelectedChild('all')}
              >
                All Children ({myChildren.length})
              </button>
              {myChildren.map(ch=>(
                <button
                  key={ch.id}
                  type="button"
                  className={`btn ${selectedChild === ch.id ? 'btn-primary' : 'btn-ghost'}`}
                  style={{padding:'6px 14px',fontSize:13}}
                  onClick={()=>setSelectedChild(ch.id)}
                >
                  {ch.firstName} (Class {ch.classId})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-2" style={{gap:12}}>
            {myChildren.map(ch=>{
              const chAtt = atts.filter(x=>x.studentId===ch.id);
              const chFees = fees.filter(x=>x.studentId===ch.id);
              const chBal = chFees.reduce((n,x)=>n+x.balance,0);
              const isSelected = selectedChild === 'all' || selectedChild === ch.id;
              return (
                <div 
                  key={ch.id} 
                  style={{
                    padding:14,
                    borderRadius:10,
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: isSelected ? '#fff' : '#f8fafc',
                    cursor: 'pointer'
                  }}
                  onClick={()=>setSelectedChild(ch.id)}
                >
                  <div className="topline" style={{marginBottom:6}}>
                    <div>
                      <strong style={{fontSize:16}}>{ch.firstName} {ch.lastName}</strong>
                      <div className="muted" style={{fontSize:12}}>Admission: {ch.admissionNumber} • Roll: {ch.rollNumber}</div>
                    </div>
                    <span className="badge badge-orange">Class {ch.classId}</span>
                  </div>
                  <div style={{display:'flex',gap:16,marginTop:10,fontSize:13}}>
                    <div><span className="muted" style={{fontSize:11}}>Attendance:</span> <strong>{attendancePercent(chAtt)}%</strong></div>
                    <div><span className="muted" style={{fontSize:11}}>Outstanding Fee:</span> <strong style={{color: chBal > 0 ? '#b91c1c' : '#15803d'}}>₹{chBal.toLocaleString('en-IN')}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stats">
        {cardData.map(([k,v])=>(
          <div className="card stat" key={String(k)}>
            <div className="muted">{k}</div>
            <div className="num">{v}</div>
          </div>
        ))}
      </div>

      <div className="split" style={{marginTop:20}}>
        <div className="card">
          <h3>Latest Notices</h3>
          {notices.slice(0,5).map(n=>(
            <div className="list-row" key={n.id}>
              <div>
                <strong>{n.title}</strong>
                <div className="muted" style={{fontSize:12}}>{formatDate(n.publishedDate)}</div>
              </div>
              <Badge status={n.priority}>{n.priority}</Badge>
            </div>
          ))}
        </div>
        <div className="card">
          <h3>Upcoming Events</h3>
          {events.slice(0,5).map(e=>(
            <div className="list-row" key={e.id}>
              <div>
                <strong>{e.title}</strong>
                <div className="muted" style={{fontSize:12}}>{formatDate(e.date)} • {e.time}</div>
              </div>
              <Badge>{e.location}</Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Students({role}:{role:Role}){
  const toast=useToast();
  const u=currentUser(role)!;
  const allStudents=getCollection<Student>('students');
  const classes=getCollection<SchoolClass>('classes');
  
  const [q,setQ]=useState('');
  const [selectedStandard,setSelectedStandard]=useState<string>('');
  const [selectedSection,setSelectedSection]=useState<string>('');
  const [editing,setEditing]=useState<Student|null>(null);
  const [form,setForm]=useState<Partial<Student>>({status:'Active',gender:'Male'});

  const teacher = role==='teacher' ? getOne<Teacher>('teachers',u.entityId) : null;
  const teacherClassIds = teacher?.assignedClassIds || [];
  const availableClasses = useMemo(()=>{
    return role==='teacher' 
      ? classes.filter(c=>teacherClassIds.includes(c.id)) 
      : classes;
  },[role, classes, teacherClassIds]);

  const standards = useMemo(()=>{
    return Array.from(new Set(availableClasses.map(c=>c.standard))).sort((a,b)=>a-b);
  },[availableClasses]);

  const sections = useMemo(()=>{
    const filteredClasses = selectedStandard 
      ? availableClasses.filter(c=>String(c.standard)===selectedStandard) 
      : availableClasses;
    return Array.from(new Set(filteredClasses.map(c=>c.section))).sort();
  },[availableClasses, selectedStandard]);

  const visible = useMemo(()=>{
    return role==='teacher'
      ? allStudents.filter(s=>teacherClassIds.includes(s.classId))
      : allStudents;
  },[role, allStudents, teacherClassIds]);

  const filtered = useMemo(()=>{
    return visible.filter(s=>{
      if(selectedStandard){
        const cls = classes.find(c=>c.id===s.classId);
        if(!cls || String(cls.standard)!==selectedStandard) return false;
      }
      if(selectedSection){
        if(s.section!==selectedSection) return false;
      }
      if(q.trim()){
        const searchStr = `${s.firstName} ${s.lastName} ${s.admissionNumber}`.toLowerCase();
        if(!searchStr.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  },[visible, selectedStandard, selectedSection, q, classes]);

  const save=()=>{
    if(!form.firstName||!form.lastName||!form.classId){
      toast.show('First name, last name and class are required.','error');
      return;
    }
    const c=getOne<SchoolClass>('classes',form.classId)!;
    upsert('students',{
      id:editing?.id||`student-${Date.now()}`,
      admissionNumber:form.admissionNumber||`AVM${Date.now().toString().slice(-6)}`,
      firstName:form.firstName,
      lastName:form.lastName,
      dateOfBirth:form.dateOfBirth||'2015-01-15',
      gender:form.gender||'Male',
      classId:c.id,
      section:c.section,
      rollNumber:Number(form.rollNumber||1),
      phone:form.phone||'',
      email:form.email||'',
      address:form.address||'',
      parentIds:form.parentIds||[],
      admissionDate:form.admissionDate||new Date().toISOString().slice(0,10),
      status:(form.status as Student['status'])||'Active'
    });
    toast.show(editing?.id?'Student updated.':'Student added.');
    setEditing(null);
    setForm({status:'Active',gender:'Male'});
    location.reload();
  };

  const clearFilters = () => {
    setSelectedStandard('');
    setSelectedSection('');
    setQ('');
  };

  return (
    <>
      <Header 
        title={role==='teacher' ? "My Students" : "Students"} 
        subtitle={role==='teacher' ? "Students enrolled in your assigned classes and sections." : "Search and manage student records with class and section filters."} 
        action={role==='admin'?<button className="btn btn-primary" onClick={()=>setEditing({} as Student)}><Plus size={16}/> Add Student</button>:undefined}
      />
      <div className="card">
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:14}}>
          <div style={{flex:1,minWidth:220}}>
            <input 
              className="input" 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              placeholder="Search by name or admission number"
            />
          </div>
          <div style={{minWidth:140}}>
            <select 
              className="input" 
              value={selectedStandard} 
              onChange={e=>setSelectedStandard(e.target.value)}
            >
              <option value="">All Classes</option>
              {standards.map(std=><option key={std} value={String(std)}>Class {std}</option>)}
            </select>
          </div>
          <div style={{minWidth:140}}>
            <select 
              className="input" 
              value={selectedSection} 
              onChange={e=>setSelectedSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {sections.map(sec=><option key={sec} value={sec}>Section {sec}</option>)}
            </select>
          </div>
          {(selectedStandard || selectedSection || q) && (
            <button className="btn btn-ghost" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
          <button 
            className="btn btn-ghost" 
            onClick={()=>csvDownload('students.csv',filtered.map(s=>({admission:s.admissionNumber,name:`${s.firstName} ${s.lastName}`,class:s.classId,section:s.section,status:s.status})))}
          >
            <Download size={15}/> CSV
          </button>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,fontSize:13,color:'var(--muted)'}}>
          <div>
            Showing <strong>{filtered.length}</strong> of {visible.length} students
            {selectedStandard && ` • Class ${selectedStandard}`}
            {selectedSection && ` • Section ${selectedSection}`}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Admission</th>
                <th>Name</th>
                <th>Class</th>
                <th>Roll</th>
                <th>Status</th>
                <th/>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{textAlign:'center',padding:'24px',color:'var(--muted)'}}>
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(s=>(
                  <tr key={s.id}>
                    <td><strong>{s.admissionNumber}</strong></td>
                    <td>{s.firstName} {s.lastName}</td>
                    <td><span className="badge badge-orange">{s.classId}</span></td>
                    <td>{s.rollNumber}</td>
                    <td><Badge status={s.status}>{s.status}</Badge></td>
                    <td>
                      {role==='admin' && (
                        <div style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost" onClick={()=>{setEditing(s);setForm(s)}} title="Edit student">
                            <Edit3 size={15}/>
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={()=>{
                              if(confirm(`Are you sure you want to delete ${s.firstName} ${s.lastName}?`)){
                                remove('students',s.id);
                                toast.show('Student deleted.');
                                location.reload();
                              }
                            }} 
                            title="Delete student"
                          >
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Modal title={editing.id?'Edit Student':'Add Student'} onClose={()=>setEditing(null)} onSave={save}>
          <div className="form-grid">
            <Field label="First Name" value={form.firstName||''} onChange={v=>setForm(x=>({...x,firstName:v}))}/><Field label="Last Name" value={form.lastName||''} onChange={v=>setForm(x=>({...x,lastName:v}))}/><Field label="Admission Number" value={form.admissionNumber||''} onChange={v=>setForm(x=>({...x,admissionNumber:v}))}/><div className="field"><label className="label">Class</label><select className="input" value={form.classId||''} onChange={e=>setForm(x=>({...x,classId:e.target.value}))}><option value="">Select</option>{getCollection<SchoolClass>('classes').map(c=><option key={c.id} value={c.id}>{c.standard}-{c.section}</option>)}</select></div><Field label="Roll Number" type="number" value={String(form.rollNumber||1)} onChange={v=>setForm(x=>({...x,rollNumber:Number(v)}))}/><Field label="Phone" value={form.phone||''} onChange={v=>setForm(x=>({...x,phone:v}))}/><Field label="Email" value={form.email||''} onChange={v=>setForm(x=>({...x,email:v}))}/></div>
        </Modal>
      )}
    </>
  );
}
function Teachers({role}:{role:Role}){
  const toast=useToast();
  const teachers=getCollection<Teacher>('teachers');
  const classes=getCollection<SchoolClass>('classes');
  const [q,setQ]=useState('');
  const [editing,setEditing]=useState<Teacher|null>(null);
  const [form,setForm]=useState<Partial<Teacher>>({
    status:'Active',
    experience:3,
    designation:'Teacher',
    qualification:'M.A, B.Ed',
    subjects:['English'],
    assignedClassIds:[]
  });

  const allSubjects = ['English','Mathematics','Science','Social Studies','Telugu','Computer Science','Hindi','Physical Education','Art'];

  const filtered = useMemo(()=>{
    return teachers.filter(t=>{
      const s = `${t.name} ${t.employeeId} ${t.designation} ${t.subjects.join(' ')}`.toLowerCase();
      return s.includes(q.toLowerCase());
    });
  },[teachers,q]);

  const openAdd = () => {
    setEditing({} as Teacher);
    setForm({
      employeeId: `EMP${String(teachers.length + 1).padStart(3,'0')}`,
      status:'Active',
      experience:3,
      designation:'Teacher',
      qualification:'M.A, B.Ed',
      subjects:['English'],
      assignedClassIds:[]
    });
  };

  const openEdit = (t:Teacher) => {
    setEditing(t);
    setForm({ ...t });
  };

  const toggleSubject = (sub:string) => {
    const subs = form.subjects || [];
    if(subs.includes(sub)){
      setForm(x=>({...x, subjects: subs.filter(s=>s!==sub)}));
    } else {
      setForm(x=>({...x, subjects: [...subs, sub]}));
    }
  };

  const toggleClass = (classId:string) => {
    const cls = form.assignedClassIds || [];
    if(cls.includes(classId)){
      setForm(x=>({...x, assignedClassIds: cls.filter(id=>id!==classId)}));
    } else {
      setForm(x=>({...x, assignedClassIds: [...cls, classId]}));
    }
  };

  const save = () => {
    if(!form.name || !form.email){
      toast.show('Teacher name and email are required.','error');
      return;
    }
    const id = editing?.id || `teacher-${Date.now()}`;
    const teacherData: Teacher = {
      id,
      employeeId: form.employeeId || `EMP${String(Date.now()).slice(-3)}`,
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      qualification: form.qualification || 'B.Ed',
      experience: Number(form.experience || 0),
      subjects: (form.subjects && form.subjects.length > 0) ? form.subjects : ['English'],
      assignedClassIds: form.assignedClassIds || [],
      status: (form.status as Teacher['status']) || 'Active',
      designation: form.designation || 'Teacher'
    };
    upsert('teachers', teacherData);
    toast.show(editing?.id ? 'Teacher updated successfully.' : 'Teacher added successfully.');
    setEditing(null);
    location.reload();
  };

  const removeTeacher = (t:Teacher) => {
    if(confirm(`Are you sure you want to delete ${t.name}? This will remove them from faculty records.`)){
      remove('teachers', t.id);
      toast.show('Teacher deleted successfully.');
      location.reload();
    }
  };

  return (
    <>
      <Header 
        title="Teachers" 
        subtitle="Faculty, subjects and assigned classes."
        action={role==='admin' ? (
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16}/> Add Teacher
          </button>
        ) : undefined}
      />
      <div className="card" style={{marginBottom:18}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input 
            className="input" 
            placeholder="Search teachers by name, subject, or designation..." 
            value={q} 
            onChange={e=>setQ(e.target.value)}
          />
          <div className="muted" style={{whiteSpace:'nowrap',fontSize:13}}>
            Total: <strong>{filtered.length}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-3">
        {filtered.map(t=>(
          <div className="card" key={t.id} style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <div className="topline">
                <strong>{t.name}</strong>
                <Badge status={t.status}>{t.status}</Badge>
              </div>
              <p className="muted" style={{margin:'4px 0 8px'}}>{t.designation} • {t.qualification}</p>
              <p style={{margin:'4px 0'}}>
                <strong>Subjects:</strong> {t.subjects.join(' • ')}
              </p>
              <p className="muted" style={{margin:'4px 0 10px'}}>{t.experience} years experience • {t.employeeId}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:12}}>
                {t.assignedClassIds.map(id=>{
                  const c = getOne<SchoolClass>('classes',id);
                  return c ? <span className="badge badge-orange" key={id}>{c.standard}-{c.section}</span> : null;
                })}
              </div>
            </div>

            {role==='admin' && (
              <div style={{display:'flex',justifyContent:'flex-end',gap:8,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                <button className="btn btn-ghost" onClick={()=>openEdit(t)} title="Edit teacher">
                  <Edit3 size={15}/> Edit
                </button>
                <button className="btn btn-danger" onClick={()=>removeTeacher(t)} title="Delete teacher">
                  <Trash2 size={15}/> Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit Teacher' : 'Add Teacher'} onClose={()=>setEditing(null)} onSave={save}>
          <div className="form-grid">
            <Field label="Full Name" value={form.name||''} onChange={v=>setForm(x=>({...x,name:v}))}/>
            <Field label="Employee ID" value={form.employeeId||''} onChange={v=>setForm(x=>({...x,employeeId:v}))}/>
            <Field label="Email Address" value={form.email||''} onChange={v=>setForm(x=>({...x,email:v}))}/>
            <Field label="Phone Number" value={form.phone||''} onChange={v=>setForm(x=>({...x,phone:v}))}/>
            <div className="field">
              <label className="label">Designation</label>
              <select className="input" value={form.designation||'Teacher'} onChange={e=>setForm(x=>({...x,designation:e.target.value}))}>
                <option value="Senior Teacher">Senior Teacher</option>
                <option value="Teacher">Teacher</option>
                <option value="Head of Department">Head of Department</option>
                <option value="Primary Teacher">Primary Teacher</option>
                <option value="Physical Education Trainer">Physical Education Trainer</option>
              </select>
            </div>
            <Field label="Qualification" value={form.qualification||''} onChange={v=>setForm(x=>({...x,qualification:v}))}/>
            <Field label="Experience (Years)" type="number" value={String(form.experience||0)} onChange={v=>setForm(x=>({...x,experience:Number(v)}))}/>
            <div className="field">
              <label className="label">Status</label>
              <select className="input" value={form.status||'Active'} onChange={e=>setForm(x=>({...x,status:e.target.value as Teacher['status']}))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="field" style={{marginTop:10}}>
            <label className="label">Subjects Taught (Click to select/deselect)</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {allSubjects.map(sub=>{
                const isSelected = form.subjects?.includes(sub);
                return (
                  <button 
                    key={sub} 
                    type="button" 
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`} 
                    style={{padding:'6px 12px',fontSize:12}}
                    onClick={()=>toggleSubject(sub)}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field" style={{marginTop:10}}>
            <label className="label">Assigned Classes (Click to select/deselect)</label>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {classes.map(c=>{
                const isSelected = form.assignedClassIds?.includes(c.id);
                return (
                  <button 
                    key={c.id} 
                    type="button" 
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-ghost'}`} 
                    style={{padding:'6px 12px',fontSize:12}}
                    onClick={()=>toggleClass(c.id)}
                  >
                    Class {c.standard}-{c.section}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
function Classes({role}:{role:Role}){
  const toast=useToast();
  const u=currentUser(role)!;
  const cs=getCollection<SchoolClass>('classes');
  const ss=getCollection<Student>('students');
  const teachers=getCollection<Teacher>('teachers');
  const teacher=role==='teacher'?getOne<Teacher>('teachers',u.entityId):null;

  const baseClasses = useMemo(()=>{
    return role==='teacher'
      ? cs.filter(c=>teacher?.assignedClassIds.includes(c.id))
      : cs;
  },[role, cs, teacher]);
  
  const [selectedStandard,setSelectedStandard]=useState<string>('');
  const [addingSection,setAddingSection]=useState(false);
  const [editingClass,setEditingClass]=useState<SchoolClass|null>(null);

  const [addForm,setAddForm]=useState<{standard:number;section:string;roomNumber:string;classTeacherId:string}>({
    standard: 1,
    section: 'C',
    roomNumber: 'Room 105',
    classTeacherId: teachers[0]?.id || ''
  });

  const [editForm,setEditForm]=useState<{roomNumber:string;classTeacherId:string;academicYear:string}>({
    roomNumber: '',
    classTeacherId: '',
    academicYear: '2026-27'
  });

  const standards = useMemo(()=>{
    return Array.from(new Set(baseClasses.map(c=>c.standard))).sort((a,b)=>a-b);
  },[baseClasses]);

  const filteredClasses = useMemo(()=>{
    return selectedStandard 
      ? baseClasses.filter(c=>String(c.standard)===selectedStandard) 
      : baseClasses;
  },[baseClasses, selectedStandard]);

  const openAddSection = () => {
    const std = Number(selectedStandard) || 1;
    setAddForm({
      standard: std,
      section: 'C',
      roomNumber: `Room ${100 + std}`,
      classTeacherId: teachers[0]?.id || ''
    });
    setAddingSection(true);
  };

  const openEditRoom = (c:SchoolClass) => {
    setEditingClass(c);
    setEditForm({
      roomNumber: c.roomNumber,
      classTeacherId: c.classTeacherId,
      academicYear: c.academicYear
    });
  };

  const saveNewSection = () => {
    const sec = addForm.section.trim().toUpperCase();
    if(!sec){
      toast.show('Section name is required (e.g. A, B, C).','error');
      return;
    }
    const classId = `class-${addForm.standard}-${sec}`;
    if(cs.some(c=>c.id===classId)){
      toast.show(`Section ${sec} already exists for Class ${addForm.standard}.`,'error');
      return;
    }
    const newClass: SchoolClass = {
      id: classId,
      standard: Number(addForm.standard),
      section: sec,
      roomNumber: addForm.roomNumber || `Room ${100 + Number(addForm.standard)}`,
      classTeacherId: addForm.classTeacherId || teachers[0]?.id || 'teacher-001',
      subjects: ['English','Mathematics','Science','Social Studies','Telugu','Computer Science'],
      academicYear: '2026-27'
    };
    upsert('classes', newClass);
    toast.show(`Class ${addForm.standard} - Section ${sec} added successfully.`);
    setAddingSection(false);
    location.reload();
  };

  const saveEditRoom = () => {
    if(!editingClass) return;
    const updated: SchoolClass = {
      ...editingClass,
      roomNumber: editForm.roomNumber || editingClass.roomNumber,
      classTeacherId: editForm.classTeacherId || editingClass.classTeacherId,
      academicYear: editForm.academicYear || editingClass.academicYear
    };
    upsert('classes', updated);
    toast.show(`Room allocation & details updated for Class ${editingClass.standard}-${editingClass.section}.`);
    setEditingClass(null);
    location.reload();
  };

  const deleteSection = (c:SchoolClass) => {
    const enrolledStudents = ss.filter(s=>s.classId===c.id);
    let msg = `Are you sure you want to delete Class ${c.standard} - Section ${c.section}?`;
    if(enrolledStudents.length > 0){
      msg = `WARNING: Class ${c.standard} - ${c.section} currently has ${enrolledStudents.length} enrolled student(s).\n\nDeleting this section will remove it from the system. Are you sure you want to proceed?`;
    }
    if(confirm(msg)){
      remove('classes', c.id);
      toast.show(`Section ${c.standard}-${c.section} deleted.`);
      location.reload();
    }
  };

  return (
    <>
      <Header 
        title={role==='teacher' ? "My Assigned Classes & Sections" : "Classes & Sections"} 
        subtitle={role==='teacher' ? "Classes and sections assigned to you." : "Manage standards, add/delete sections, and allocate rooms."}
        action={role==='admin' ? (
          <button className="btn btn-primary" onClick={openAddSection}>
            <Plus size={16}/> Add Section
          </button>
        ) : undefined}
      />

      <div className="card" style={{marginBottom:18}}>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <div style={{minWidth:160}}>
            <select 
              className="input" 
              value={selectedStandard} 
              onChange={e=>setSelectedStandard(e.target.value)}
            >
              <option value="">{role==='teacher' ? 'All Assigned Classes' : 'All Standards (1–10)'}</option>
              {standards.map(std=><option key={std} value={String(std)}>Class {std}</option>)}
            </select>
          </div>
          {selectedStandard && (
            <button className="btn btn-ghost" onClick={()=>setSelectedStandard('')}>
              Show All
            </button>
          )}
          <div className="muted" style={{marginLeft:'auto',fontSize:13}}>
            Total Sections: <strong>{filteredClasses.length}</strong>
          </div>
        </div>
      </div>

      {filteredClasses.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <p className="muted">No assigned classes found matching your filter.</p>
        </div>
      ) : (
        <div className="grid grid-4">
          {filteredClasses.map(c=>{
            const count = ss.filter(s=>s.classId===c.id).length;
            const teacher = getOne<Teacher>('teachers',c.classTeacherId);
            return (
              <div className="card" key={c.id} style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div>
                  <div className="topline" style={{marginBottom:8}}>
                    <span className="badge badge-orange">{c.standard}-{c.section}</span>
                    <span className="badge" style={{background:'#f1f5f9',color:'#475569'}}>{c.academicYear}</span>
                  </div>
                  <h3 style={{margin:'6px 0'}}>Class {c.standard} — {c.section}</h3>
                  <p style={{margin:'4px 0',fontWeight:600,color:'var(--primary-dark)'}}>
                    📍 Room {c.roomNumber}
                  </p>
                  <p className="muted" style={{margin:'4px 0'}}>{count} students enrolled</p>
                  <p className="muted" style={{margin:'4px 0 12px',fontSize:12}}>
                    Class teacher: <strong>{teacher?.name || 'Unassigned'}</strong>
                  </p>
                </div>

                {role==='admin' && (
                  <div style={{display:'flex',gap:6,marginTop:12,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                    <button 
                      className="btn btn-ghost" 
                      style={{flex:1,padding:'7px 10px',fontSize:12}} 
                      onClick={()=>openEditRoom(c)}
                      title="Allocate or Change Room"
                    >
                      <Edit3 size={14}/> Change Room
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{padding:'7px 10px'}} 
                      onClick={()=>deleteSection(c)}
                      title="Delete Section"
                    >
                      <Trash2 size={14}/>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {addingSection && (
        <Modal title="Add New Class Section" onClose={()=>setAddingSection(false)} onSave={saveNewSection}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Class / Standard</label>
              <select 
                className="input" 
                value={addForm.standard} 
                onChange={e=>setAddForm(x=>({...x, standard: Number(e.target.value)}))}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(num=>(
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>
            <Field 
              label="Section Name (e.g. A, B, C, D)" 
              value={addForm.section} 
              onChange={v=>setAddForm(x=>({...x, section: v.toUpperCase()}))}
            />
            <Field 
              label="Room Number / Allocation (e.g. Room 105)" 
              value={addForm.roomNumber} 
              onChange={v=>setAddForm(x=>({...x, roomNumber: v}))}
            />
            <div className="field">
              <label className="label">Class Teacher</label>
              <select 
                className="input" 
                value={addForm.classTeacherId} 
                onChange={e=>setAddForm(x=>({...x, classTeacherId: e.target.value}))}
              >
                {teachers.map(t=>(
                  <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}

      {editingClass && (
        <Modal 
          title={`Allocate / Change Room: Class ${editingClass.standard} - ${editingClass.section}`} 
          onClose={()=>setEditingClass(null)} 
          onSave={saveEditRoom}
        >
          <div className="form-grid">
            <Field 
              label="Allocated Room Number" 
              value={editForm.roomNumber} 
              onChange={v=>setEditForm(x=>({...x, roomNumber: v}))}
            />
            <div className="field">
              <label className="label">Class Teacher</label>
              <select 
                className="input" 
                value={editForm.classTeacherId} 
                onChange={e=>setEditForm(x=>({...x, classTeacherId: e.target.value}))}
              >
                {teachers.map(t=>(
                  <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
                ))}
              </select>
            </div>
            <Field 
              label="Academic Year" 
              value={editForm.academicYear} 
              onChange={v=>setEditForm(x=>({...x, academicYear: v}))}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
function Attendance({role}:{role:Role}){
  const toast=useToast();
  const u=currentUser(role)!;
  const classes=getCollection<SchoolClass>('classes');
  const teacher=getOne<Teacher>('teachers',u.entityId);
  const students=getCollection<Student>('students');
  
  const allowed=role==='teacher'?classes.filter(c=>teacher?.assignedClassIds.includes(c.id)):role==='student'?[]:classes;
  const own=role==='student'?getOne<Student>('students',u.entityId):undefined;
  const [classId,setClassId]=useState(allowed[0]?.id||own?.classId||'');
  const [date,setDate]=useState(new Date().toISOString().slice(0,10));
  const [attendanceRecords,setAttendanceRecords]=useState<Attendance[]>(()=>getCollection<Attendance>('attendance'));
  
  const list=students.filter(s=>s.classId===classId && (role!=='student' || s.id===u.entityId));
  const [rec,setRec]=useState<Record<string,AttendanceStatus>>({});

  useEffect(()=>{
    const out:Record<string,AttendanceStatus>={};
    list.forEach(s=>{
      const a=attendanceRecords.find(x=>x.studentId===s.id && x.date===date);
      out[s.id]=a?.status||'Present';
    });
    setRec(out);
  },[classId, date, attendanceRecords, list.length]);

  const load=()=>{
    const out:Record<string,AttendanceStatus>={};
    list.forEach(s=>{
      const a=attendanceRecords.find(x=>x.studentId===s.id && x.date===date);
      out[s.id]=a?.status||'Present';
    });
    setRec(out);
    toast.show(`Loaded ${list.length} students for ${date}.`);
  };

  const save=()=>{
    const newRecords: Attendance[] = [];
    list.forEach(s=>{
      const item: Attendance = {
        id: `att-${s.id}-${date}`,
        studentId: s.id,
        classId,
        date,
        status: rec[s.id]||'Present',
        markedBy: u.entityId
      };
      upsert('attendance', item);
      newRecords.push(item);
    });
    setAttendanceRecords(prev=>{
      const existing = prev.filter(x=>!newRecords.some(n=>n.id===x.id));
      return [...existing, ...newRecords];
    });
    const cls = classes.find(c=>c.id===classId);
    toast.show(`Attendance saved successfully for Class ${cls?.standard || ''}-${cls?.section || ''} (${date}).`);
  };

  if(role==='student'||role==='parent'){
    const parent=role==='parent'?getOne<Parent>('parents',u.entityId):undefined;
    const vis=role==='student'?students.filter(s=>s.id===u.entityId):students.filter(s=>parent?.childIds.includes(s.id));
    return (
      <>
        <Header title="Attendance" subtitle="Attendance history for the student(s) you can access."/>
        <div className="grid grid-2">
          {vis.map(s=>{
            const rs=attendanceRecords.filter(a=>a.studentId===s.id);
            return (
              <div className="card" key={s.id}>
                <div className="topline">
                  <div>
                    <h3 style={{margin:0}}>{s.firstName} {s.lastName}</h3>
                    <div className="muted">Class {s.classId} • Roll {s.rollNumber}</div>
                  </div>
                  <strong style={{fontSize:26}}>{attendancePercent(rs)}%</strong>
                </div>
                {['Present','Absent','Late','Excused'].map(x=>(
                  <div className="list-row" key={x}>
                    <span>{x}</span>
                    <strong>{rs.filter(a=>a.status===x).length}</strong>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Attendance" 
        subtitle={role==='teacher' ? "Mark attendance for your assigned classes." : "Mark Present, Absent, Late or Excused by class and date."}
      />
      <div className="card">
        <div className="form-grid">
          <div className="field">
            <label className="label">Class</label>
            <select className="input" value={classId} onChange={e=>setClassId(e.target.value)}>
              {allowed.map(c=><option key={c.id} value={c.id}>{c.standard}-{c.section}</option>)}
            </select>
          </div>
          <Field label="Date" type="date" value={date} onChange={setDate}/>
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:15}}>
          <button className="btn btn-primary" onClick={load}>Load Students</button>
          <button className="btn btn-ghost" onClick={()=>setRec(Object.fromEntries(list.map(s=>[s.id,'Present'])))}>Mark All Present</button>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.length===0 ? (
                <tr>
                  <td colSpan={3} style={{textAlign:'center',padding:20,color:'var(--muted)'}}>No students enrolled in this class.</td>
                </tr>
              ) : (
                list.map(s=>(
                  <tr key={s.id}>
                    <td><strong>{s.firstName} {s.lastName}</strong></td>
                    <td>{s.rollNumber}</td>
                    <td>
                      <select 
                        className="input" 
                        value={rec[s.id]||'Present'} 
                        onChange={e=>setRec(x=>({...x,[s.id]:e.target.value as AttendanceStatus}))}
                      >
                        {['Present','Absent','Late','Excused'].map(x=><option key={x}>{x}</option>)}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
          <button className="btn btn-primary" onClick={save}><Save size={15}/> Save Attendance</button>
        </div>
      </div>
    </>
  );
}

function Activities({role}:{role:Role}){const toast=useToast(),u=currentUser(role)!;const classes=getCollection<SchoolClass>('classes'),t=getOne<Teacher>('teachers',u.entityId);const allowed=role==='teacher'?classes.filter(c=>t?.assignedClassIds.includes(c.id)):classes;const student=role==='student'?getOne<Student>('students',u.entityId):undefined;const parent=role==='parent'?getOne<Parent>('parents',u.entityId):undefined;const [show,setShow]=useState(false);const [form,setForm]=useState<Partial<ClassActivity>>({date:new Date().toISOString().slice(0,10),subject:'Mathematics'});const all=getCollection<ClassActivity>('activities');const visible=role==='admin'?all:role==='teacher'?all.filter(a=>allowed.some(c=>c.id===a.classId)):all.filter(a=>{const ids=role==='student'?[student?.id]:parent?.childIds;return getCollection<Student>('students').some(s=>ids?.includes(s.id)&&s.classId===a.classId)});const save=()=>{if(!form.title||!form.classId){toast.show('Title and class are required.','error');return}const c=getOne<SchoolClass>('classes',form.classId)!;upsert('activities',{id:`activity-${Date.now()}`,title:form.title,classId:c.id,section:c.section,subject:form.subject||'Mathematics',date:form.date||'',description:form.description||'',learningObjective:form.learningObjective||'',participation:form.participation||'',homework:form.homework||'',teacherId:u.entityId});toast.show('Class activity created.');setShow(false);location.reload()};return <><Header title="Class Activities" subtitle="What was taught, learning objectives, participation and homework." action={(role==='admin'||role==='teacher')&&<button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={16}/> Add Activity</button>}/><div className="grid">{visible.slice(0,50).map(a=><div className="card" key={a.id}><div className="topline"><div><strong>{a.title}</strong><div className="muted">{a.subject} • {getOne<SchoolClass>('classes',a.classId)?.standard}-{a.section}</div></div><Badge>{formatDate(a.date)}</Badge></div><p className="muted">{a.description}</p><div className="grid grid-2"><div><strong>Learning Objective</strong><p className="muted">{a.learningObjective}</p></div><div><strong>Homework</strong><p className="muted">{a.homework}</p></div></div></div>)}</div>{show&&<Modal title="Add Class Activity" onClose={()=>setShow(false)} onSave={save}><Field label="Activity Title" value={form.title||''} onChange={v=>setForm(x=>({...x,title:v}))}/><div className="form-grid"><div className="field"><label className="label">Class</label><select className="input" value={form.classId||''} onChange={e=>setForm(x=>({...x,classId:e.target.value}))}><option value="">Select</option>{allowed.map(c=><option key={c.id} value={c.id}>{c.standard}-{c.section}</option>)}</select></div><Field label="Subject" value={form.subject||''} onChange={v=>setForm(x=>({...x,subject:v}))}/><Field label="Date" type="date" value={form.date||''} onChange={v=>setForm(x=>({...x,date:v}))}/></div><div className="field"><label className="label">Description</label><textarea className="input" rows={3} value={form.description||''} onChange={e=>setForm(x=>({...x,description:e.target.value}))}/></div><div className="field"><label className="label">Learning Objective</label><textarea className="input" rows={2} value={form.learningObjective||''} onChange={e=>setForm(x=>({...x,learningObjective:e.target.value}))}/></div><div className="field"><label className="label">Participation</label><textarea className="input" rows={2} value={form.participation||''} onChange={e=>setForm(x=>({...x,participation:e.target.value}))}/></div><div className="field"><label className="label">Homework</label><textarea className="input" rows={2} value={form.homework||''} onChange={e=>setForm(x=>({...x,homework:e.target.value}))}/></div></Modal>}</>}

function Assignments({role}:{role:Role}){
  const toast=useToast();
  const u=currentUser(role)!;
  const all=getCollection<Assignment>('assignments');
  const classes=getCollection<SchoolClass>('classes');
  const students=getCollection<Student>('students');
  const t=getOne<Teacher>('teachers',u.entityId);
  const s=role==='student'?getOne<Student>('students',u.entityId):undefined;
  const p=role==='parent'?getOne<Parent>('parents',u.entityId):undefined;
  
  const allowed=role==='teacher'?classes.filter(c=>t?.assignedClassIds.includes(c.id)):classes;
  const myChildren = useMemo(()=>p ? students.filter(st=>p.childIds.includes(st.id)) : [], [p, students]);
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const visible = useMemo(()=>{
    if(role==='student') return all.filter(a=>a.classId===s?.classId);
    if(role==='teacher') return all.filter(a=>allowed.some(c=>c.id===a.classId));
    if(role==='parent'){
      const targetChildren = selectedChild === 'all' 
        ? myChildren 
        : myChildren.filter(c => c.id === selectedChild);
      const targetClassIds = targetChildren.map(c => c.classId);
      return all.filter(a => targetClassIds.includes(a.classId));
    }
    return all;
  },[role, all, s, allowed, myChildren, selectedChild]);

  const [show,setShow]=useState(false);
  const [form,setForm]=useState<Partial<Assignment>>({
    assignedDate:new Date().toISOString().slice(0,10),
    dueDate:new Date(Date.now()+86400000*7).toISOString().slice(0,10),
    maximumMarks:20
  });

  const save=()=>{
    if(!form.title||!form.classId||!form.subject){
      toast.show('Title, class and subject are required.','error');
      return;
    }
    const c=getOne<SchoolClass>('classes',form.classId)!;
    upsert('assignments',{
      id:`assignment-${Date.now()}`,
      title:form.title,
      description:form.description||'',
      subject:form.subject,
      classId:c.id,
      section:c.section,
      assignedDate:form.assignedDate||'',
      dueDate:form.dueDate||'',
      maximumMarks:Number(form.maximumMarks||20),
      instructions:form.instructions||'',
      teacherId:u.entityId
    });
    toast.show('Assignment created.');
    setShow(false);
    location.reload();
  };

  return (
    <>
      <Header 
        title="Assignments" 
        subtitle="Assignments and homework connected to student classes." 
        action={(role==='admin'||role==='teacher')&&<button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={16}/> Create Assignment</button>}
      />

      {role === 'parent' && myChildren.length > 1 && (
        <div className="card" style={{marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <span className="muted" style={{fontSize:13,fontWeight:600}}>Filter by Child:</span>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button
              type="button"
              className={`btn ${selectedChild === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{padding:'6px 14px',fontSize:12}}
              onClick={()=>setSelectedChild('all')}
            >
              All Children ({myChildren.length})
            </button>
            {myChildren.map(ch => (
              <button
                key={ch.id}
                type="button"
                className={`btn ${selectedChild === ch.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{padding:'6px 14px',fontSize:12}}
                onClick={()=>setSelectedChild(ch.id)}
              >
                {ch.firstName} (Class {ch.classId})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid">
        {visible.length === 0 ? (
          <div className="card" style={{textAlign:'center',padding:40}}>
            <p className="muted">No assignments found for this selection.</p>
          </div>
        ) : (
          visible.slice(0,50).map(a=>{
            const sub=getCollection<AssignmentSubmission>('submissions').find(x=>x.assignmentId===a.id&&x.studentId===u.entityId);
            const child = role === 'parent' 
              ? myChildren.find(st => st.classId === a.classId) 
              : null;
            const cls = getOne<SchoolClass>('classes', a.classId);

            return (
              <div className="card" key={a.id}>
                <div className="topline">
                  <div>
                    <h3 style={{margin:0}}>{a.title}</h3>
                    <div className="muted" style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginTop:4}}>
                      <span>{a.subject}</span>
                      <span>•</span>
                      <span>Class {cls ? `${cls.standard}-${a.section}` : a.classId}</span>
                      {role==='parent' && child && (
                        <span className="badge badge-orange" style={{fontSize:12,fontWeight:600}}>
                          Student: {child.firstName} {child.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge>{formatDate(a.dueDate)}</Badge>
                </div>
                <p className="muted" style={{marginTop:8}}>{a.description}</p>
                <div className="topline" style={{marginTop:12,paddingTop:10,borderTop:'1px solid var(--border)'}}>
                  <span>Maximum Marks: <strong>{a.maximumMarks}</strong></span>
                  {(role==='student'||role==='parent')&&<Badge status={sub?.status}>{sub?.status||'Pending'}</Badge>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {show&&<Modal title="Create Assignment" onClose={()=>setShow(false)} onSave={save}>
        <div className="form-grid">
          <Field label="Title" value={form.title||''} onChange={v=>setForm(x=>({...x,title:v}))}/>
          <Field label="Subject" value={form.subject||''} onChange={v=>setForm(x=>({...x,subject:v}))}/>
          <div className="field">
            <label className="label">Class</label>
            <select className="input" value={form.classId||''} onChange={e=>setForm(x=>({...x,classId:e.target.value}))}>
              <option value="">Select</option>
              {allowed.map(c=><option key={c.id} value={c.id}>{c.standard}-{c.section}</option>)}
            </select>
          </div>
          <Field label="Maximum Marks" type="number" value={String(form.maximumMarks||20)} onChange={v=>setForm(x=>({...x,maximumMarks:Number(v)}))}/><Field label="Assigned Date" type="date" value={form.assignedDate||''} onChange={v=>setForm(x=>({...x,assignedDate:v}))}/><Field label="Due Date" type="date" value={form.dueDate||''} onChange={v=>setForm(x=>({...x,dueDate:v}))}/></div><div className="field"><label className="label">Description</label><textarea className="input" rows={3} value={form.description||''} onChange={e=>setForm(x=>({...x,description:e.target.value}))}/></div></Modal>}
    </>
  );
}

function Results({role}:{role:Role}){
  const u=currentUser(role)!,
        results=getCollection<Result>('results'),
        students=getCollection<Student>('students'),
        exams=getCollection<Examination>('exams'),
        p=role==='parent'?getOne<Parent>('parents',u.entityId):null,
        teacher=role==='teacher'?getOne<Teacher>('teachers',u.entityId):null;

  const teacherStudents = teacher ? students.filter(s=>teacher.assignedClassIds.includes(s.classId)) : [];
  const teacherStudentIds = teacherStudents.map(s=>s.id);

  const vis = role==='student'
    ? results.filter(r=>r.studentId===u.entityId)
    : role==='parent'
    ? results.filter(r=>p?.childIds.includes(r.studentId))
    : role==='teacher'
    ? results.filter(r=>teacherStudentIds.includes(r.studentId))
    : results;

  const ids=[...new Set(vis.map(r=>r.studentId))];

  return (
    <>
      <Header 
        title={role==='teacher' ? "Student Performance" : "Results"} 
        subtitle={role==='teacher' ? "Academic examination results and marks for students in your assigned classes." : "Actual seeded examination records with calculated grades."}
      />
      {ids.length === 0 ? (
        <div className="card" style={{textAlign:'center',padding:40}}>
          <p className="muted">No examination results recorded yet for your assigned students.</p>
        </div>
      ) : (
        <div className="grid">
          {ids.map(id=>{
            const st=students.find(s=>s.id===id),
                  rs=vis.filter(r=>r.studentId===id),
                  total=rs.reduce((n,r)=>n+r.maximumMarks,0),
                  got=rs.reduce((n,r)=>n+r.marksObtained,0);
            return (
              <div className="card" key={id}>
                <div className="topline">
                  <div>
                    <h3 style={{margin:0}}>{st?`${st.firstName} ${st.lastName}`:id}</h3>
                    <div className="muted">{st ? `Class ${st.classId} • Roll ${st.rollNumber}` : id}</div>
                  </div>
                  <strong style={{fontSize:24}}>{total?Math.round(got/total*100):0}%</strong>
                </div>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Exam</th>
                        <th>Subject</th>
                        <th>Marks</th>
                        <th>Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rs.map(r=>(
                        <tr key={r.id}>
                          <td>{exams.find(e=>e.id===r.examId)?.name}</td>
                          <td>{r.subject}</td>
                          <td>{r.marksObtained}/{r.maximumMarks}</td>
                          <td><Badge>{gradeFor(r.marksObtained,r.maximumMarks)}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
function Fees({role}:{role:Role}){
  const toast=useToast();
  const u=currentUser(role)!;
  
  const [feesList, setFeesList] = useState<Fee[]>(()=>ensureStudentFees());
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);

  const students = getCollection<Student>('students');
  const classes = getCollection<SchoolClass>('classes');
  const p = role==='parent' ? getOne<Parent>('parents',u.entityId) : null;
  const myChildren = useMemo(()=>p ? students.filter(s=>p.childIds.includes(s.id)) : [], [p, students]);

  const [q,setQ] = useState('');
  const [selectedStandard,setSelectedStandard] = useState('');
  const [selectedSection,setSelectedSection] = useState('');
  const [selectedFeeType,setSelectedFeeType] = useState<'All' | 'School Fee' | 'Transport Fee' | 'Activity Fee'>('All');
  const [selectedChild, setSelectedChild] = useState<string>('all');

  const [recordingFee,setRecordingFee] = useState<{fee:Fee; student:Student}|null>(null);
  const [payAmount,setPayAmount] = useState<number>(0);
  const [payMethod,setPayMethod] = useState<'UPI' | 'Cash' | 'Cheque' | 'Bank Transfer' | 'Card'>('UPI');
  const [payDate,setPayDate] = useState<string>(new Date().toISOString().slice(0,10));

  const standards = useMemo(()=>{
    return Array.from(new Set(classes.map(c=>c.standard))).sort((a,b)=>a-b);
  },[classes]);

  const sections = useMemo(()=>{
    const filteredClasses = selectedStandard 
      ? classes.filter(c=>String(c.standard)===selectedStandard) 
      : classes;
    return Array.from(new Set(filteredClasses.map(c=>c.section))).sort();
  },[classes, selectedStandard]);

  const baseFees = useMemo(()=>{
    if(role==='student') return feesList.filter(f=>f.studentId===u.entityId);
    if(role==='parent'){
      const targetChildren = selectedChild === 'all' 
        ? myChildren 
        : myChildren.filter(c => c.id === selectedChild);
      const targetIds = targetChildren.map(c => c.id);
      return feesList.filter(f => targetIds.includes(f.studentId));
    }
    return feesList;
  },[role, feesList, u.entityId, selectedChild, myChildren]);

  const filteredFees = useMemo(()=>{
    return baseFees.filter(f=>{
      const st = students.find(s=>s.id===f.studentId);
      if(!st) return false;

      if(selectedFeeType !== 'All' && f.feeType !== selectedFeeType){
        return false;
      }

      if(selectedStandard){
        const cls = classes.find(c=>c.id===st.classId);
        if(!cls || String(cls.standard)!==selectedStandard) return false;
      }

      if(selectedSection){
        if(st.section !== selectedSection) return false;
      }

      if(q.trim()){
        const searchStr = `${st.firstName} ${st.lastName} ${st.admissionNumber}`.toLowerCase();
        if(!searchStr.includes(q.toLowerCase())) return false;
      }

      return true;
    });
  },[baseFees, selectedFeeType, selectedStandard, selectedSection, q, students, classes]);

  const openPaymentModal = (fee:Fee, student:Student) => {
    setRecordingFee({fee, student});
    setPayAmount(fee.balance);
    setPayMethod('UPI');
    setPayDate(new Date().toISOString().slice(0,10));
  };

  const handleRecordPayment = () => {
    if(!recordingFee) return;
    const {fee, student} = recordingFee;
    const amountToPay = Number(payAmount);
    if(amountToPay <= 0){
      toast.show('Please enter a valid payment amount greater than 0.','error');
      return;
    }
    if(amountToPay > fee.balance){
      toast.show(`Payment amount cannot exceed the remaining balance of ₹${fee.balance.toLocaleString('en-IN')}.`,'error');
      return;
    }

    const newPaid = fee.paidAmount + amountToPay;
    const feeStatusInfo = calcFeeStatus(fee.amount, newPaid, fee.dueDate);
    const updatedFee: Fee = {
      ...fee,
      paidAmount: newPaid,
      balance: feeStatusInfo.balance,
      status: feeStatusInfo.status,
      paymentDate: payDate,
      paymentMethod: payMethod
    };
    upsert('fees', updatedFee);
    
    // Update state directly without page reload
    setFeesList(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
    setRecordingFee(null);

    // Immediately trigger receipt modal
    const receiptData: ReceiptData = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      classId: student.classId,
      feeType: fee.feeType,
      totalAmount: fee.amount,
      paidAmount: newPaid,
      paidNow: amountToPay,
      balance: feeStatusInfo.balance,
      paymentDate: payDate,
      paymentMethod: payMethod,
      status: feeStatusInfo.status
    };
    setActiveReceipt(receiptData);
    toast.show(`Payment of ₹${amountToPay.toLocaleString('en-IN')} recorded for ${student.firstName}. Receipt generated!`);
  };

  const openExistingReceipt = (f: Fee, st: Student) => {
    const receiptData: ReceiptData = {
      receiptNo: `REC-${f.id.replace('fee-','')}`,
      studentName: `${st.firstName} ${st.lastName}`,
      admissionNumber: st.admissionNumber,
      classId: st.classId,
      feeType: f.feeType,
      totalAmount: f.amount,
      paidAmount: f.paidAmount,
      balance: f.balance,
      paymentDate: f.paymentDate || '2026-03-01',
      paymentMethod: f.paymentMethod || 'UPI',
      status: f.status
    };
    setActiveReceipt(receiptData);
  };

  const totalAmount = filteredFees.reduce((n,f)=>n+f.amount,0);
  const totalPaid = filteredFees.reduce((n,f)=>n+f.paidAmount,0);
  const totalBalance = filteredFees.reduce((n,f)=>n+f.balance,0);

  const feeTypes: Array<'All' | 'School Fee' | 'Transport Fee' | 'Activity Fee'> = [
    'All',
    'School Fee',
    'Transport Fee',
    'Activity Fee'
  ];

  return (
    <>
      <Header 
        title="Fees" 
        subtitle={role==='parent' ? "Fee status, records and receipts for your children." : "Fee balances, categories, and payment collection."} 
        action={role==='admin' && (
          <button 
            className="btn btn-ghost" 
            onClick={()=>{
              csvDownload('fees-report.csv', filteredFees.map(f=>{
                const st = students.find(s=>s.id===f.studentId);
                return {
                  admission: st?.admissionNumber || '',
                  student: st ? `${st.firstName} ${st.lastName}` : f.studentId,
                  class: st?.classId || '',
                  section: st?.section || '',
                  type: f.feeType,
                  amount: f.amount,
                  paid: f.paidAmount,
                  balance: f.balance,
                  status: f.status,
                  paymentDate: f.paymentDate || ''
                };
              }));
            }}
          >
            <Download size={15}/> Export
          </button>
        )}
      />

      {role === 'parent' && myChildren.length > 1 && (
        <div className="card" style={{marginBottom:16,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <span className="muted" style={{fontSize:13,fontWeight:600}}>Select Child:</span>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button
              type="button"
              className={`btn ${selectedChild === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{padding:'6px 14px',fontSize:12}}
              onClick={()=>setSelectedChild('all')}
            >
              All Children ({myChildren.length})
            </button>
            {myChildren.map(ch => (
              <button
                key={ch.id}
                type="button"
                className={`btn ${selectedChild === ch.id ? 'btn-primary' : 'btn-ghost'}`}
                style={{padding:'6px 14px',fontSize:12}}
                onClick={()=>setSelectedChild(ch.id)}
              >
                {ch.firstName} (Class {ch.classId})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="stats" style={{marginBottom:18}}>
        {[
          ['Total', totalAmount],
          ['Paid', totalPaid],
          ['Balance', totalBalance]
        ].map(([k,v])=>(
          <div className="card stat" key={String(k)}>
            <div className="muted">{k} ({selectedFeeType === 'All' ? 'All Types' : selectedFeeType})</div>
            <div className="num">₹{Number(v).toLocaleString('en-IN')}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Fee Type Filter Tabs */}
        <div style={{marginBottom:16}}>
          <div className="label" style={{marginBottom:8}}>Select Fee Type (School Fee / Transport / Activity):</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {feeTypes.map(ft=>(
              <button
                key={ft}
                type="button"
                className={`btn ${selectedFeeType === ft ? 'btn-primary' : 'btn-ghost'}`}
                style={{padding:'8px 16px',fontSize:13}}
                onClick={()=>setSelectedFeeType(ft)}
              >
                {ft === 'All' ? 'All Fee Types' : ft}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Controls: Search, Class, Section */}
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center',marginBottom:14}}>
          <div style={{flex:1,minWidth:220}}>
            <input 
              className="input" 
              value={q} 
              onChange={e=>setQ(e.target.value)} 
              placeholder="Search by student name or admission number"
            />
          </div>
          {role !== 'parent' && (
            <>
              <div style={{minWidth:140}}>
                <select 
                  className="input" 
                  value={selectedStandard} 
                  onChange={e=>setSelectedStandard(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {standards.map(std=><option key={std} value={String(std)}>Class {std}</option>)}
                </select>
              </div>
              <div style={{minWidth:140}}>
                <select 
                  className="input" 
                  value={selectedSection} 
                  onChange={e=>setSelectedSection(e.target.value)}
                >
                  <option value="">All Sections</option>
                  {sections.map(sec=><option key={sec} value={sec}>Section {sec}</option>)}
                </select>
              </div>
            </>
          )}
          {(selectedStandard || selectedSection || q || selectedFeeType !== 'All' || selectedChild !== 'all') && (
            <button 
              className="btn btn-ghost" 
              onClick={()=>{
                setSelectedStandard('');
                setSelectedSection('');
                setQ('');
                setSelectedFeeType('All');
                setSelectedChild('all');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Status indicator */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,fontSize:13,color:'var(--muted)'}}>
          <div>
            Showing <strong>{filteredFees.length}</strong> fee records
            {selectedFeeType !== 'All' && <span> • <strong>{selectedFeeType}</strong></span>}
            {selectedStandard && <span> • Class {selectedStandard}</span>}
            {selectedSection && <span> • Section {selectedSection}</span>}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Admission</th>
                <th>Student</th>
                <th>Class</th>
                <th>Fee Type</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{textAlign:'center',padding:'24px',color:'var(--muted)'}}>
                    No fee records found for the selected filters.
                  </td>
                </tr>
              ) : (
                filteredFees.map(f=>{
                  const st = students.find(s=>s.id===f.studentId);
                  return (
                    <tr key={f.id}>
                      <td><strong>{st?.admissionNumber || '—'}</strong></td>
                      <td>{st ? `${st.firstName} ${st.lastName}` : f.studentId}</td>
                      <td><span className="badge badge-orange">{st?.classId || '—'}</span></td>
                      <td>
                        <span 
                          className="badge" 
                          style={{
                            background: f.feeType==='School Fee' ? '#e0f2fe' : f.feeType==='Transport Fee' ? '#fef3c7' : '#f3e8ff',
                            color: f.feeType==='School Fee' ? '#0369a1' : f.feeType==='Transport Fee' ? '#b45309' : '#7e22ce'
                          }}
                        >
                          {f.feeType}
                        </span>
                      </td>
                      <td>₹{f.amount.toLocaleString('en-IN')}</td>
                      <td>₹{f.paidAmount.toLocaleString('en-IN')}</td>
                      <td><strong style={{color: f.balance > 0 ? '#b91c1c' : '#15803d'}}>₹{f.balance.toLocaleString('en-IN')}</strong></td>
                      <td><Badge status={f.status}>{f.status}</Badge></td>
                      <td>
                        <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                          {role==='admin' && f.balance > 0 && (
                            <button 
                              className="btn btn-primary" 
                              style={{padding:'6px 10px',fontSize:12}}
                              onClick={()=>st && openPaymentModal(f, st)}
                            >
                              Record Pay
                            </button>
                          )}
                          {f.paidAmount > 0 ? (
                            <button
                              className="btn btn-ghost"
                              style={{padding:'6px 10px',fontSize:12,display:'inline-flex',alignItems:'center',gap:4}}
                              title="Download / View Receipt"
                              onClick={()=>st && openExistingReceipt(f, st)}
                            >
                              <Download size={13}/> Receipt
                            </button>
                          ) : role !== 'admin' ? (
                            <span className="muted" style={{fontSize:12}}>Pending</span>
                          ) : f.balance === 0 ? (
                            <span className="badge badge-green">Cleared</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Recording Modal */}
      {recordingFee && (
        <Modal 
          title={`Record Payment — ${recordingFee.student.firstName} ${recordingFee.student.lastName}`}
          onClose={()=>setRecordingFee(null)}
          onSave={handleRecordPayment}
        >
          <div style={{background:'#f8fafc',borderRadius:12,padding:'14px 16px',marginBottom:16,border:'1px solid var(--border)'}}>
            <div className="grid grid-2" style={{gap:10}}>
              <div><span className="muted" style={{fontSize:12}}>Admission No:</span> <strong>{recordingFee.student.admissionNumber}</strong></div>
              <div><span className="muted" style={{fontSize:12}}>Class & Section:</span> <strong>{recordingFee.student.classId}</strong></div>
              <div><span className="muted" style={{fontSize:12}}>Fee Category:</span> <strong>{recordingFee.fee.feeType}</strong></div>
              <div><span className="muted" style={{fontSize:12}}>Current Outstanding:</span> <strong style={{color:'#b91c1c',fontSize:16}}>₹{recordingFee.fee.balance.toLocaleString('en-IN')}</strong></div>
            </div>
          </div>

          <div className="form-grid">
            <Field 
              label={`Payment Amount (₹) — Max: ₹${recordingFee.fee.balance.toLocaleString('en-IN')}`} 
              type="number"
              value={String(payAmount)} 
              onChange={v=>setPayAmount(Math.min(recordingFee.fee.balance, Math.max(0, Number(v))))}
            />
            <div className="field">
              <label className="label">Payment Method</label>
              <select 
                className="input" 
                value={payMethod} 
                onChange={e=>setPayMethod(e.target.value as any)}
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / Net Banking</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Credit / Debit Card</option>
              </select>
            </div>
            <Field 
              label="Payment Date" 
              type="date" 
              value={payDate} 
              onChange={setPayDate}
            />
          </div>
        </Modal>
      )}

      {/* Receipt Modal with Print & Download */}
      {activeReceipt && (
        <ReceiptModal 
          receipt={activeReceipt} 
          onClose={()=>setActiveReceipt(null)}
        />
      )}
    </>
  );
}
function Notices({role}:{role:Role}){const toast=useToast(),u=currentUser(role)!,all=getCollection<Notice>('notices'),st=role==='student'?getOne<Student>('students',u.entityId):null,p=role==='parent'?getOne<Parent>('parents',u.entityId):null;const visible=all.filter(n=>n.status==='Published').filter(n=>n.audience==='Everyone'||(role==='teacher'&&n.audience==='Teachers')||(role==='student'&&n.audience==='Students')||(role==='parent'&&n.audience==='Parents')||(n.audience==='Specific Class'&&n.targetClassId===st?.classId));const [show,setShow]=useState(false),[form,setForm]=useState<Partial<Notice>>({category:'General',audience:'Everyone',priority:'Normal',status:'Published',publishedDate:new Date().toISOString().slice(0,10),expiryDate:new Date(Date.now()+86400000*30).toISOString().slice(0,10)});const save=()=>{if(!form.title||!form.description){toast.show('Title and description are required.','error');return}upsert('notices',{id:`notice-${Date.now()}`,title:form.title,description:form.description,category:form.category||'General',publishedDate:form.publishedDate||'',expiryDate:form.expiryDate||'',audience:form.audience||'Everyone',targetClassId:form.targetClassId,priority:form.priority||'Normal',status:'Published'});toast.show('Notice published.');setShow(false);location.reload()};return <><Header title="Notices" subtitle="Announcements filtered by role and audience." action={role==='admin'&&<button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={16}/> New Notice</button>}/><div className="grid">{visible.map(n=><div className="card" key={n.id}><div className="topline"><div><span className="badge badge-orange">{n.category}</span><h3>{n.title}</h3></div><Badge status={n.priority}>{n.priority}</Badge></div><p className="muted">{n.description}</p><div className="muted" style={{fontSize:12}}>{formatDate(n.publishedDate)} • {n.audience}</div></div>)}</div>{show&&<Modal title="New Notice" onClose={()=>setShow(false)} onSave={save}><Field label="Title" value={form.title||''} onChange={v=>setForm(x=>({...x,title:v}))}/><div className="field"><label className="label">Description</label><textarea className="input" rows={4} value={form.description||''} onChange={e=>setForm(x=>({...x,description:e.target.value}))}/></div><div className="form-grid"><Field label="Category" value={form.category||''} onChange={v=>setForm(x=>({...x,category:v}))}/><div className="field"><label className="label">Priority</label><select className="input" value={form.priority||'Normal'} onChange={e=>setForm(x=>({...x,priority:e.target.value as Notice['priority']}))}><option>Normal</option><option>Important</option><option>Urgent</option></select></div><div className="field"><label className="label">Audience</label><select className="input" value={form.audience||'Everyone'} onChange={e=>setForm(x=>({...x,audience:e.target.value as Notice['audience']}))}><option>Everyone</option><option>Teachers</option><option>Students</option><option>Parents</option><option>Specific Class</option></select></div></div></Modal>}</>}
function Events({role}:{role:Role}){const toast=useToast(),all=getCollection<EventItem>('events');const [show,setShow]=useState(false),[form,setForm]=useState<Partial<EventItem>>({status:'Upcoming',date:new Date(Date.now()+86400000*7).toISOString().slice(0,10),time:'10:00 AM',image:'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1000&q=80'});const save=()=>{if(!form.title||!form.date){toast.show('Title and date are required.','error');return}upsert('events',{id:`event-${Date.now()}`,title:form.title,description:form.description||'',date:form.date,time:form.time||'',location:form.location||'',image:form.image||'',status:'Upcoming'});toast.show('Event created.');setShow(false);location.reload()};return <><Header title="Events" subtitle="Shared school calendar." action={role==='admin'&&<button className="btn btn-primary" onClick={()=>setShow(true)}><Plus size={16}/> Create Event</button>}/><div className="grid grid-3">{all.map(e=><div className="card" key={e.id}><img src={e.image} alt={e.title} style={{width:'100%',height:150,objectFit:'cover',borderRadius:14}}/><h3>{e.title}</h3><p className="muted">{formatDate(e.date)} • {e.time}</p><p className="muted">{e.description}</p><Badge>{e.location}</Badge></div>)}</div>{show&&<Modal title="Create Event" onClose={()=>setShow(false)} onSave={save}><Field label="Title" value={form.title||''} onChange={v=>setForm(x=>({...x,title:v}))}/><div className="form-grid"><Field label="Date" type="date" value={form.date||''} onChange={v=>setForm(x=>({...x,date:v}))}/><Field label="Time" value={form.time||''} onChange={v=>setForm(x=>({...x,time:v}))}/><Field label="Location" value={form.location||''} onChange={v=>setForm(x=>({...x,location:v}))}/><Field label="Image URL" value={form.image||''} onChange={v=>setForm(x=>({...x,image:v}))}/></div><div className="field"><label className="label">Description</label><textarea className="input" rows={3} value={form.description||''} onChange={e=>setForm(x=>({...x,description:e.target.value}))}/></div></Modal>}</>}
function Profile({role}:{role:Role}){const u=currentUser(role)!;const data=role==='student'?getOne<Student>('students',u.entityId):role==='teacher'?getOne<Teacher>('teachers',u.entityId):role==='parent'?getOne<Parent>('parents',u.entityId):u;return <><Header title="Profile" subtitle="Your account and role-linked information."/><div className="card" style={{maxWidth:760}}><h2>{u.name}</h2><p className="muted">{u.email} • {u.phone}</p><div className="grid grid-2">{Object.entries(data||{}).filter(([k])=>!['password','photo'].includes(k)).map(([k,v])=><div className="card" key={k}><div className="muted" style={{fontSize:12}}>{k}</div><strong>{Array.isArray(v)?v.join(', '):String(v)}</strong></div>)}</div></div></>}
function Settings(){const toast=useToast(),[form,setForm]=useState<AppSettings>(getSettings());const save=()=>{setSettings(form);toast.show('Settings saved.');};const reset=()=>{resetDatabase();toast.show('Demo database restored.');location.reload()};return <><Header title="Settings" subtitle="School details and demo data reset."/><div className="card" style={{maxWidth:850}}><div className="form-grid"><Field label="School Name" value={form.schoolName} onChange={v=>setForm(x=>({...x,schoolName:v}))}/><Field label="Academic Year" value={form.academicYear} onChange={v=>setForm(x=>({...x,academicYear:v}))}/><Field label="Phone" value={form.phone} onChange={v=>setForm(x=>({...x,phone:v}))}/><Field label="Email" value={form.email} onChange={v=>setForm(x=>({...x,email:v}))}/><Field label="Principal" value={form.principalName} onChange={v=>setForm(x=>({...x,principalName:v}))}/><Field label="Website" value={form.website} onChange={v=>setForm(x=>({...x,website:v}))}/></div><div className="field"><label className="label">Address</label><textarea className="input" rows={3} value={form.schoolAddress} onChange={e=>setForm(x=>({...x,schoolAddress:e.target.value}))}/></div><div style={{display:'flex',gap:10,justifyContent:'flex-end'}}><button className="btn btn-primary" onClick={save}>Save Settings</button><button className="btn btn-danger" onClick={reset}><RotateCcw size={15}/> Reset Demo Database</button></div></div></>}
function Reports(){const st=getCollection<Student>('students'),cs=getCollection<SchoolClass>('classes'),a=getCollection<Attendance>('attendance'),f=getCollection<Fee>('fees'),r=getCollection<Result>('results');return <><Header title="Reports" subtitle="Data-driven reports with CSV export."/><div className="grid grid-2"><div className="card"><h3>Students by Class</h3>{cs.map(c=><div className="list-row" key={c.id}><span>{c.standard}-{c.section}</span><strong>{st.filter(s=>s.classId===c.id).length}</strong></div>)}<button className="btn btn-ghost" onClick={()=>csvDownload('students-by-class.csv',cs.map(c=>({class:`${c.standard}-${c.section}`,students:st.filter(s=>s.classId===c.id).length})))}><Download size={15}/> Export</button></div><div className="card"><h3>Attendance</h3><p className="muted">Overall: <strong>{attendancePercent(a)}%</strong></p>{(['Present','Absent','Late','Excused'] as AttendanceStatus[]).map(x=><div className="list-row" key={x}><span>{x}</span><strong>{a.filter(q=>q.status===x).length}</strong></div>)}<button className="btn btn-ghost" onClick={()=>csvDownload('attendance.csv',a.map(x=>({student:x.studentId,date:x.date,status:x.status})))}><Download size={15}/> Export</button></div><div className="card"><h3>Fees</h3><p className="muted">Collected ₹{f.reduce((n,x)=>n+x.paidAmount,0).toLocaleString('en-IN')} of ₹{f.reduce((n,x)=>n+x.amount,0).toLocaleString('en-IN')}</p><button className="btn btn-ghost" onClick={()=>csvDownload('fees.csv',f.map(x=>({student:x.studentId,amount:x.amount,paid:x.paidAmount,balance:x.balance,status:x.status})))}><Download size={15}/> Export</button></div><div className="card"><h3>Results</h3><p className="muted">Rows: {r.length}</p><p className="muted">Average: {r.length?Math.round(r.reduce((n,x)=>n+x.marksObtained/x.maximumMarks*100,0)/r.length):0}%</p><button className="btn btn-ghost" onClick={()=>csvDownload('results.csv',r.map(x=>({student:x.studentId,exam:x.examId,subject:x.subject,marks:x.marksObtained,max:x.maximumMarks,grade:gradeFor(x.marksObtained,x.maximumMarks)})))}><Download size={15}/> Export</button></div></div></>}
function Exams(){const exams=getCollection<Examination>('exams');return <><Header title="Examinations" subtitle="Seeded exam records and schedules."/><div className="grid grid-2">{exams.map(e=><div className="card" key={e.id}><span className="badge badge-orange">{e.academicYear}</span><h3>{e.name}</h3><p className="muted">Class {getOne<SchoolClass>('classes',e.classId)?.standard}-{getOne<SchoolClass>('classes',e.classId)?.section}</p><p>{formatDate(e.startDate)} — {formatDate(e.endDate)}</p><p className="muted">{e.description}</p></div>)}</div></>}
function Generic({role,module}:{role:Role;module:string}){switch(module){case'dashboard':return <Dashboard role={role}/>;case'students':return <Students role={role}/>;case'teachers':return <Teachers role={role}/>;case'classes':return <Classes role={role}/>;case'attendance':return <Attendance role={role}/>;case'activities':return <Activities role={role}/>;case'assignments':return <Assignments role={role}/>;case'results':return <Results role={role}/>;case'fees':return <Fees role={role}/>;case'notices':return <Notices role={role}/>;case'events':return <Events role={role}/>;case'profile':return <Profile role={role}/>;case'settings':return <Settings/>;case'reports':return <Reports/>;case'examinations':return <Exams/>;case'performance':return <Results role={role}/>;default:return <div className="card"><Header title={module}/><p className="muted">No module found.</p></div>}}
export default function ModuleClient({role,module}:{role:Role;module:string}){return <DashboardLayout role={role}><Generic role={role} module={module}/></DashboardLayout>}
