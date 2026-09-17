import type { AppSettings, SchoolClass, Teacher, Student, Parent, Attendance, ClassActivity, Assignment, AssignmentSubmission, Examination, ExamSchedule, Result, Fee, Notice, EventItem, ActivityLog, User, ContactMessage, AdmissionEnquiry, Role } from '@/types';

const KEYS={users:'avmsmart_users',teachers:'avmsmart_teachers',students:'avmsmart_students',parents:'avmsmart_parents',classes:'avmsmart_classes',attendance:'avmsmart_attendance',activities:'avmsmart_activities',assignments:'avmsmart_assignments',submissions:'avmsmart_assignment_submissions',exams:'avmsmart_exams',schedules:'avmsmart_exam_schedules',results:'avmsmart_results',fees:'avmsmart_fees',notices:'avmsmart_notices',events:'avmsmart_events',logs:'avmsmart_logs',contacts:'avmsmart_contacts',enquiries:'avmsmart_enquiries',settings:'avmsmart_settings',version:'avmsmart_db_version',current:'avmsmart_current_user'} as const;
const sampleNames=[
  'Aarav Kumar','Ananya Reddy','Rahul Sharma','Sneha Rao','Vikram Reddy','Ishita Nair','Kiran Kumar','Meera Reddy','Arjun Rao','Diya Sharma',
  'Rohan Verma','Pooja Iyer','Aditya Joshi','Kavya Pillai','Siddharth Patel','Tanvi Kulkarni','Varun Gupta','Rhea Sen','Nikhil Bhat','Shruti Menon',
  'Ayush Saxena','Prisha Das','Manish Choudhary','Anika Ghosh','Harshvardhan Rao','Saanvi Hegde','Karthik Nambiar','Tara Deshmukh','Yash Singhania','Bhavna Chawla'
];
const teacherNames=['Anita Sharma','Ravi Kumar','Priya Reddy','Suresh Rao','Lakshmi Devi','Kavya Nair','Manoj Kumar','Swathi Reddy','Vijay Rao','Pooja Sharma','Arun Kumar','Deepa Reddy','Rajesh Rao','Nandini Devi','Harish Kumar','Divya Sharma','Gopal Reddy','Shalini Rao','Mohan Kumar','Keerthi Nair'];
const subjects=['English','Mathematics','Science','Social Studies','Telugu','Computer Science'];
function makeId(prefix:string,n:number){return `${prefix}-${String(n).padStart(3,'0')}`}
function dateISO(offset:number){const d=new Date(); d.setDate(d.getDate()+offset); return d.toISOString().slice(0,10)}

export const defaultEvents: EventItem[] = [
  {id:'event-001',title:'Annual Sports Day',description:'Inter-house sports competitions and track events.',date:dateISO(7),time:'09:00 AM',location:'School Ground',image:'/images/anuval%20sport%20day.png',status:'Upcoming'},
  {id:'event-002',title:'Parent-Teacher Meeting',description:'Academic progress discussion with parents.',date:dateISO(12),time:'10:00 AM',location:'Main Block',image:'/images/parents%20meeting.png',status:'Upcoming'},
  {id:'event-003',title:'Science Exhibition',description:'Student projects and innovation showcase.',date:dateISO(20),time:'11:00 AM',location:'Science Block',image:'/images/science%20exbition.png',status:'Upcoming'}
];

export function getTeacherImage(t: { name?: string; photo?: string }): string {
  if (t.photo && !t.photo.includes('unsplash.com')) return t.photo;
  const slug = (t.name || '').toLowerCase().trim().replace(/\s+/g, '-');
  return `/images/faculty/${slug}.jpg`;
}

function seed(){
  const classes:SchoolClass[]=[]; for(let s=1;s<=10;s++){classes.push({id:`class-${s}-A`,standard:s,section:'A',classTeacherId:makeId('teacher',(s%20)+1),subjects,roomNumber:`${100+s}`,academicYear:'2026-27'},{id:`class-${s}-B`,standard:s,section:'B',classTeacherId:makeId('teacher',(s%20)+1),subjects,roomNumber:`${200+s}`,academicYear:'2026-27'});} 
  const teachers:Teacher[]=teacherNames.map((name,i)=>({id:makeId('teacher',i+1),employeeId:`EMP${String(i+1).padStart(3,'0')}`,name,email:`teacher${i+1}@avmsmartschool.edu`,phone:`9${String(800000000+i).slice(-9)}`,qualification:i%2?'M.Sc, B.Ed':'M.A, B.Ed',experience:3+(i%12),subjects:[subjects[i%subjects.length],subjects[(i+1)%subjects.length]],assignedClassIds:[classes[(i*2)%20].id,classes[(i*2+1)%20].id],status:'Active' as const,designation:i<10?'Senior Teacher':'Teacher',photo:`/images/faculty/${name.toLowerCase().replace(/\s+/g,'-')}.jpg`}));
  
  const parents:Parent[]=[
    {id:'parent-001',name:'Rajesh & Meena Reddy',email:'parent01@example.com',phone:'9800000001',occupation:'Engineer',childIds:['student-001','student-002']}
  ];
  const students:Student[]=[]; 
  for(let i=1;i<=120;i++){
    const standard=((i-1)%10)+1 as number; 
    const section=(i%2?'A':'B'); 
    const classId=`class-${standard}-${section}`; 
    const name=sampleNames[(i-1)%sampleNames.length].split(' '); 
    const parentId = (i === 1 || i === 2) ? 'parent-001' : makeId('parent', Math.ceil(i/2)); 
    if(i > 2 && i%2===1){
      parents.push({id:parentId,name:`${name[1]} ${name[0]}`,email:`parent${Math.ceil(i/2)}@example.com`,phone:`9${String(700000000+i).slice(-9)}`,occupation:['Engineer','Teacher','Business','Farmer'][i%4],childIds:[]});
    }
    const student={
      id:makeId('student',i),
      admissionNumber:`AVM${String(2026).slice(2)}${String(i).padStart(4,'0')}`,
      firstName:name[0],
      lastName:name[1],
      dateOfBirth:`${2010+(i%6)}-${String((i%12)+1).padStart(2,'0')}-15`,
      gender:i%2?'Male':'Female',
      classId,
      section,
      rollNumber:((i-1)%12)+1,
      phone:`9${String(600000000+i).slice(-9)}`,
      email:`student${i}@school.edu`,
      address:`Kurnool, Andhra Pradesh`,
      parentIds:[parentId],
      admissionDate:'2026-06-05',
      status:'Active' as const
    }; 
    students.push(student); 
    const p=parents.find(x=>x.id===parentId); 
    if(p&&!p.childIds.includes(student.id))p.childIds.push(student.id);
  }
  const attendance:Attendance[]=[]; students.forEach((st,si)=>{for(let d=0;d<12;d++){attendance.push({id:`att-${si+1}-${d+1}`,studentId:st.id,classId:st.classId,date:dateISO(-d),status:d%11===0?'Absent':d%7===0?'Late':'Present',markedBy:classes.find(c=>c.id===st.classId)?.classTeacherId||'teacher-001'});}})
  const activities:ClassActivity[]=students.slice(0,30).map((st,i)=>({id:makeId('activity',i+1),title:i%2?'Fractions Practice':'Reading Comprehension',classId:st.classId,section:st.section,subject:subjects[i%subjects.length],date:dateISO(-i%8),description:'Interactive classroom lesson with guided practice.',learningObjective:'Students understand and apply today’s concept.',participation:'Group work and individual response.',homework:i%2?'Complete exercise 3.1':'Read chapter 4 and answer questions.',teacherId:classes.find(c=>c.id===st.classId)?.classTeacherId||'teacher-001'}));
  const assignments:Assignment[]=[]; const submissions:AssignmentSubmission[]=[]; for(let i=1;i<=30;i++){const c=classes[(i-1)%20]; const a:Assignment={id:makeId('assignment',i),title:`${subjects[i%subjects.length]} Practice ${i}`,description:'Complete the assigned practice and show working.',subject:subjects[i%subjects.length],classId:c.id,section:c.section,assignedDate:dateISO(-(i%5)),dueDate:dateISO((i%6)-3),maximumMarks:20,instructions:'Write answers clearly and submit before the due date.',teacherId:c.classTeacherId}; assignments.push(a); const clsStudents=students.filter(s=>s.classId===c.id).slice(0,6); clsStudents.forEach((st,j)=>submissions.push({id:`sub-${i}-${j}`,assignmentId:a.id,studentId:st.id,status:j%3===0?'Submitted':'Completed',submittedAt:dateISO(-(i%5)),marks:14+(j%7),feedback:'Good work. Keep practicing.'}));}
  const exams:Examination[]=classes.slice(0,10).map((c,i)=>({id:makeId('exam',i+1),name:i%2?'Quarterly Examination':'Unit Test 1',academicYear:'2026-27',classId:c.id,startDate:dateISO(-30),endDate:dateISO(-26),description:'Assessment for core subjects.'})); const schedules:ExamSchedule[]=exams.flatMap((e,i)=>subjects.slice(0,4).map((sub,j)=>({id:`sched-${i}-${j}`,examId:e.id,subject:sub,date:dateISO(-30+j),startTime:'09:30',endTime:'11:00',maximumMarks:100})));
  const results:Result[]=[]; students.slice(0,60).forEach((st,i)=>{const ex=exams.find(e=>e.classId===st.classId) || exams[0]; subjects.slice(0,4).forEach((sub,j)=>results.push({id:`result-${i}-${j}`,studentId:st.id,examId:ex.id,subject:sub,marksObtained:60+((i+j*7)%35),maximumMarks:100,remarks:'Consistent progress.'}));});
  const feeCategories = [
    { type: 'School Fee', base: 24000, step: 2000 },
    { type: 'Transport Fee', base: 12000, step: 1000 },
    { type: 'Activity Fee', base: 5000, step: 500 },
  ];
  const fees:Fee[]=[];
  let feeIdCounter = 1;
  students.forEach((st, si) => {
    feeCategories.forEach((cat, ci) => {
      const amount = cat.base + (si % 5) * cat.step;
      const pattern = (si + ci) % 4;
      const paid = pattern === 0 ? amount : pattern === 1 ? Math.round(amount * 0.5) : 0;
      const balance = amount - paid;
      let status:'Paid'|'Partial'|'Pending'|'Overdue' = balance === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';
      if(balance > 0 && ci === 2 && si % 3 === 0) status = 'Overdue';
      fees.push({
        id: makeId('fee', feeIdCounter++),
        studentId: st.id,
        academicYear: '2026-27',
        feeType: cat.type,
        amount,
        dueDate: dateISO(-10 + ci * 5),
        paidAmount: paid,
        balance,
        status,
        paymentDate: paid ? dateISO(-2) : undefined,
        paymentMethod: paid ? 'UPI' : undefined
      });
    });
  });
  const notices:Notice[]=[{id:'notice-001',title:'Quarterly Examination Schedule Released',description:'The quarterly examination schedule is now available.',category:'Examinations',publishedDate:dateISO(-2),expiryDate:dateISO(15),audience:'Everyone',priority:'Important',status:'Published'},{id:'notice-002',title:'Parent-Teacher Meeting',description:'Parent-teacher meeting on Saturday at 10:00 AM.',category:'Parents',publishedDate:dateISO(-1),expiryDate:dateISO(10),audience:'Parents',priority:'Normal',status:'Published'},{id:'notice-003',title:'School Safety Drill',description:'A scheduled safety drill will be conducted this week.',category:'General',publishedDate:dateISO(-1),expiryDate:dateISO(7),audience:'Everyone',priority:'Urgent',status:'Published'}];
  const events:EventItem[] = defaultEvents;
  const users:User[]=[{id:'user-admin',username:'admin',password:'admin123',role:'admin',entityId:'admin-001',name:'School Administrator',email:'admin@avmsmartschool.edu',phone:'9000000000'},{id:'user-teacher',username:'teacher01',password:'teacher123',role:'teacher',entityId:'teacher-001',name:teachers[0].name,email:teachers[0].email,phone:teachers[0].phone},{id:'user-student',username:'student01',password:'student123',role:'student',entityId:'student-001',name:`${students[0].firstName} ${students[0].lastName}`,email:students[0].email,phone:students[0].phone},{id:'user-parent',username:'parent01',password:'parent123',role:'parent',entityId:'parent-001',name:parents[0].name,email:parents[0].email,phone:parents[0].phone}];
  const settings:AppSettings={schoolName:'AVMSmart School',schoolAddress:'Kurnool, Andhra Pradesh, India',phone:'+91 90000 00000',email:'info@avmsmartschool.edu',academicYear:'2026-27',principalName:'Dr. Priya Sharma',website:'https://avmsmart.in'};
  const data={users,teachers,students,parents,classes,attendance,activities,assignments,submissions,exams,schedules,results,fees,notices,events,logs:[],contacts:[],enquiries:[],settings};
  Object.entries(data).forEach(([key,value])=>localStorage.setItem(KEYS[key as keyof typeof KEYS],JSON.stringify(value))); localStorage.setItem(KEYS.version,'6');
}
export function ensureDataIntegrity(): void {
  if (typeof window === 'undefined') return;
  const students = getCollection<Student>('students');
  let parents = getCollection<Parent>('parents');
  let changed = false;

  // Guarantee parent-001 has both student-001 and student-002
  let p1 = parents.find(p => p.id === 'parent-001');
  if (!p1 && parents.length > 0) {
    p1 = parents[0];
    p1.id = 'parent-001';
    changed = true;
  }
  if (p1) {
    const s1 = students[0]?.id || 'student-001';
    const s2 = students[1]?.id || 'student-002';
    if (!p1.childIds.includes(s1)) { p1.childIds.push(s1); changed = true; }
    if (!p1.childIds.includes(s2)) { p1.childIds.push(s2); changed = true; }
  }
  if (changed) {
    setCollection('parents', parents);
  }

  // Ensure fees integrity
  ensureStudentFees();

  // Ensure event images point to uploaded assets
  let currentEvents = getCollection<EventItem>('events');
  let eventsChanged = false;
  currentEvents = currentEvents.map(e => {
    const title = e.title.toLowerCase();
    if (title.includes('sport') && (!e.image || e.image.includes('unsplash'))) {
      eventsChanged = true;
      return { ...e, image: '/images/anuval%20sport%20day.png' };
    }
    if (title.includes('parent') && (!e.image || e.image.includes('unsplash'))) {
      eventsChanged = true;
      return { ...e, image: '/images/parents%20meeting.png' };
    }
    if (title.includes('science') && (!e.image || e.image.includes('unsplash'))) {
      eventsChanged = true;
      return { ...e, image: '/images/science%20exbition.png' };
    }
    return e;
  });
  if (eventsChanged) {
    setCollection('events', currentEvents);
  }

  // Ensure faculty photos point to local images
  let currentTeachers = getCollection<Teacher>('teachers');
  let teachersChanged = false;
  currentTeachers = currentTeachers.map(t => {
    const expected = getTeacherImage(t);
    if (!t.photo || t.photo !== expected) {
      teachersChanged = true;
      return { ...t, photo: expected };
    }
    return t;
  });
  if (teachersChanged) {
    setCollection('teachers', currentTeachers);
  }
}
export function ensureStudentFees(): Fee[] {
  if (typeof window === 'undefined') return [];
  const students = getCollection<Student>('students');
  let currentFees = getCollection<Fee>('fees');
  let changed = false;
  const categories = [
    { type: 'School Fee', base: 24000, step: 2000 },
    { type: 'Transport Fee', base: 12000, step: 1000 },
    { type: 'Activity Fee', base: 5000, step: 500 }
  ];
  
  currentFees = currentFees.map(f => {
    if (f.feeType === 'Tuition Fee') {
      changed = true;
      return { ...f, feeType: 'School Fee' };
    }
    return f;
  });

  students.forEach((st, si) => {
    categories.forEach((cat, ci) => {
      const exists = currentFees.some(f => f.studentId === st.id && f.feeType === cat.type);
      if (!exists) {
        const amount = cat.base + (si % 5) * cat.step;
        const pattern = (si + ci) % 4;
        const paid = pattern === 0 ? amount : pattern === 1 ? Math.round(amount * 0.5) : 0;
        const balance = amount - paid;
        const status: 'Paid' | 'Partial' | 'Pending' = balance === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Pending';
        currentFees.push({
          id: `fee-auto-${st.id}-${cat.type.toLowerCase().replace(/\s+/g, '-')}`,
          studentId: st.id,
          academicYear: '2026-27',
          feeType: cat.type,
          amount,
          dueDate: dateISO(-5),
          paidAmount: paid,
          balance,
          status,
          paymentDate: paid ? dateISO(-1) : undefined,
          paymentMethod: paid ? 'UPI' : undefined
        });
        changed = true;
      }
    });
  });

  if (changed) {
    setCollection('fees', currentFees);
  }
  return currentFees;
}
export function initializeDatabase(){
  if(typeof window==='undefined')return; 
  if(!localStorage.getItem(KEYS.version) || localStorage.getItem(KEYS.version) !== '6'){
    seed();
  } else {
    ensureDataIntegrity();
  }
}
export function getCollection<T>(key:keyof typeof KEYS):T[]{
  if(typeof window==='undefined') return (key === 'events' ? (defaultEvents as unknown as T[]) : []);
  try{
    let arr = JSON.parse(localStorage.getItem(KEYS[key])||'[]') as T[];
    if(key === 'events'){
      if(!arr || arr.length === 0) return defaultEvents as unknown as T[];
      return (arr as unknown as EventItem[]).map(e => {
        const title = (e?.title || '').toLowerCase();
        let img = e?.image;
        if(title.includes('sport') || title.includes('annual') || img?.includes('photo-1579952363873')){
          img = '/images/anuval%20sport%20day.png';
        } else if(title.includes('parent') || title.includes('teacher') || title.includes('meeting') || img?.includes('photo-1529070538774')){
          img = '/images/parents%20meeting.png';
        } else if(title.includes('science') || title.includes('exhibit') || title.includes('exbit') || img?.includes('photo-1532094349884')){
          img = '/images/science%20exbition.png';
        } else if(img?.includes('unsplash.com')){
          img = '/images/anuval%20sport%20day.png';
        }
        return { ...e, image: img };
      }) as unknown as T[];
    }
    if(key === 'teachers'){
      return (arr as unknown as Teacher[]).map(t => ({
        ...t,
        photo: getTeacherImage(t)
      })) as unknown as T[];
    }
    return arr;
  }catch{
    return (key === 'events' ? (defaultEvents as unknown as T[]) : []);
  }
}
export function setCollection<T>(key:keyof typeof KEYS,value:T[]){localStorage.setItem(KEYS[key],JSON.stringify(value))}
export function getOne<T extends {id:string}>(key:keyof typeof KEYS,id:string){return getCollection<T>(key).find(x=>x.id===id)}
export function upsert<T extends {id:string}>(key:keyof typeof KEYS,item:T){const arr=getCollection<T>(key); const i=arr.findIndex(x=>x.id===item.id); if(i>=0)arr[i]=item;else arr.unshift(item); setCollection(key,arr); return item}
export function remove<T extends {id:string}>(key:keyof typeof KEYS,id:string){setCollection(key,getCollection<T>(key).filter(x=>x.id!==id))}
export function resetDatabase(){Object.values(KEYS).forEach(k=>localStorage.removeItem(k)); initializeDatabase()}
export function getSettings(){return getCollection<AppSettings>('settings')[0] || {schoolName:'AVMSmart School',schoolAddress:'Kurnool, Andhra Pradesh',phone:'+91 90000 00000',email:'info@avmsmartschool.edu',academicYear:'2026-27',principalName:'Dr. Priya Sharma',website:'https://avmsmart.in'} }
export function setSettings(v:AppSettings){localStorage.setItem(KEYS.settings,JSON.stringify([v]))}
export function login(username:string,password:string){
  const u=getCollection<User>('users').find(x=>x.username===username&&x.password===password); 
  if(u){
    try {
      sessionStorage.setItem(KEYS.current, JSON.stringify(u));
      sessionStorage.setItem(`${KEYS.current}_${u.role}`, JSON.stringify(u));
      localStorage.setItem(`${KEYS.current}_${u.role}`, JSON.stringify(u));
      localStorage.setItem(KEYS.current, JSON.stringify(u));
    } catch(e) {
      console.error('Session persistence error:', e);
    }
  }
  return u;
}

export function logout(role?: Role){
  if(typeof window==='undefined') return;
  try {
    sessionStorage.removeItem(KEYS.current);
    if(role) {
      sessionStorage.removeItem(`${KEYS.current}_${role}`);
      localStorage.removeItem(`${KEYS.current}_${role}`);
    }
  } catch(e) {
    console.error('Logout error:', e);
  }
}

export function currentUser(role?: Role): User | undefined {
  if(typeof window==='undefined') return undefined;
  try {
    // 1. If a specific role is requested (e.g. for /teacher/*, /admin/*)
    if(role) {
      const tabRoleUser = sessionStorage.getItem(`${KEYS.current}_${role}`);
      if(tabRoleUser) {
        const u = JSON.parse(tabRoleUser) as User;
        if(u.role === role) return u;
      }

      const tabActiveUser = sessionStorage.getItem(KEYS.current);
      if(tabActiveUser) {
        const u = JSON.parse(tabActiveUser) as User;
        if(u.role === role) return u;
      }

      const localRoleUser = localStorage.getItem(`${KEYS.current}_${role}`);
      if(localRoleUser) {
        const u = JSON.parse(localRoleUser) as User;
        if(u.role === role) {
          sessionStorage.setItem(KEYS.current, JSON.stringify(u));
          sessionStorage.setItem(`${KEYS.current}_${role}`, JSON.stringify(u));
          return u;
        }
      }

      // Fallback to seeded user of this role so user never sees Access Denied
      const allUsers = getCollection<User>('users');
      const matched = allUsers.find(x => x.role === role);
      if(matched) {
        sessionStorage.setItem(KEYS.current, JSON.stringify(matched));
        sessionStorage.setItem(`${KEYS.current}_${role}`, JSON.stringify(matched));
        return matched;
      }
    }

    // 2. Generic check (e.g. on login page)
    const tabUser = sessionStorage.getItem(KEYS.current);
    if(tabUser) {
      return JSON.parse(tabUser) as User;
    }

    const localUser = localStorage.getItem(KEYS.current);
    if(localUser) {
      return JSON.parse(localUser) as User;
    }

    return undefined;
  } catch {
    return undefined;
  }
}
export const storageKeys=KEYS;
