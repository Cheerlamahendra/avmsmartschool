# AVMSmart School

Complete school website + school management system demo built with Next.js, TypeScript, React, and localStorage.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Demo accounts

- Admin: `admin` / `admin123`
- Teacher: `teacher01` / `teacher123`
- Student: `student01` / `student123`
- Parent: `parent01` / `parent123`

## Architecture

`UI -> role-aware modules -> localStorage repository -> seeded data`

The demo seeds classes 1–10, Sections A/B, 20+ teachers, 120 students, parents with multiple children, attendance, activities, assignments, exams, results, fees, notices and events. Public faculty/events/notices use the same data sets as the dashboards.

## Demo database

Seed data is created only on first run. Admin Settings contains **Reset Demo Database**.

## Production migration

Keep the service/repository boundary and replace the localStorage repository with a REST/API repository backed by Spring Boot + MySQL/PostgreSQL, JWT authentication, and object storage for photos/documents.
