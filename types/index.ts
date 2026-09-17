export type Role='admin'|'teacher'|'student'|'parent';
export type AttendanceStatus='Present'|'Absent'|'Late'|'Excused';
export type FeeStatus='Paid'|'Partial'|'Pending'|'Overdue';
export type AssignmentStatus='Pending'|'Submitted'|'Completed'|'Overdue';
export type NoticePriority='Normal'|'Important'|'Urgent';
export interface User{ id:string; username:string; password:string; role:Role; entityId:string; name:string; email:string; phone:string; photo?:string }
export interface SchoolClass{ id:string; standard:number; section:string; classTeacherId:string; subjects:string[]; roomNumber:string; academicYear:string }
export interface Teacher{ id:string; employeeId:string; name:string; email:string; phone:string; qualification:string; experience:number; subjects:string[]; assignedClassIds:string[]; status:'Active'|'Inactive'; photo?:string; designation:string }
export interface Student{ id:string; admissionNumber:string; firstName:string; lastName:string; dateOfBirth:string; gender:string; classId:string; section:string; rollNumber:number; phone:string; email:string; address:string; parentIds:string[]; admissionDate:string; status:'Active'|'Inactive'; photo?:string }
export interface Parent{ id:string; name:string; email:string; phone:string; occupation:string; childIds:string[] }
export interface Attendance{ id:string; studentId:string; classId:string; date:string; status:AttendanceStatus; markedBy:string; remarks?:string }
export interface ClassActivity{ id:string; title:string; classId:string; section:string; subject:string; date:string; description:string; learningObjective:string; participation:string; homework:string; teacherId:string }
export interface AssignmentSubmission{ id:string; assignmentId:string; studentId:string; status:AssignmentStatus; submittedAt?:string; marks?:number; feedback?:string }
export interface Assignment{ id:string; title:string; description:string; subject:string; classId:string; section:string; assignedDate:string; dueDate:string; maximumMarks:number; instructions:string; teacherId:string }
export interface Examination{ id:string; name:string; academicYear:string; classId:string; startDate:string; endDate:string; description:string }
export interface ExamSchedule{ id:string; examId:string; subject:string; date:string; startTime:string; endTime:string; maximumMarks:number }
export interface Result{ id:string; studentId:string; examId:string; subject:string; marksObtained:number; maximumMarks:number; grade?:string; remarks:string }
export interface Fee{ id:string; studentId:string; academicYear:string; feeType:string; amount:number; dueDate:string; paidAmount:number; balance:number; status:FeeStatus; paymentDate?:string; paymentMethod?:string }
export interface Notice{ id:string; title:string; description:string; category:string; publishedDate:string; expiryDate:string; audience:'Everyone'|'Teachers'|'Students'|'Parents'|'Specific Class'; targetClassId?:string; priority:NoticePriority; status:'Published'|'Archived' }
export interface EventItem{ id:string; title:string; description:string; date:string; time:string; location:string; image:string; status:'Upcoming'|'Completed' }
export interface ActivityLog{ id:string; userId:string; action:string; entity:string; entityId:string; timestamp:string; description:string }
export interface ContactMessage{ id:string; name:string; email:string; phone:string; message:string; createdAt:string }
export interface AdmissionEnquiry{ id:string; parentName:string; studentName:string; phone:string; email:string; classApplyingFor:number; previousSchool:string; message:string; createdAt:string }
export interface AppSettings{schoolName:string; schoolAddress:string; phone:string; email:string; academicYear:string; principalName:string; website:string}
