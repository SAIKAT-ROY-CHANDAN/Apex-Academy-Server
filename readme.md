# 🏛️ Apex International College - Backend API Server (Demo Edition)

A robust Node.js/Express API server powered by Prisma ORM and MariaDB/MySQL, tailored for the **Apex International College** educational management ecosystem.

---

## 🌟 Features & Seed Data

- **Full Demo Seeding (`npm run seed:demo`)**:
  - **Super Admin**: `admin@apexacademy.edu` / `admin123` with complete system permissions
  - **Institution Configuration**: Apex International College (`COLLEGE_UNIVERSITY` mode, motto, address, phone, Cloudinary logo)
  - **Academic Programs & Departments**:
    - Higher Secondary Certificate (HSC)
    - Undergraduate Degree Program (CSE & BBA)
    - Graduate & Masters Program
    - Departments: Computer Science & Engineering, Business Administration, Natural Sciences, Humanities
  - **Academic Structure**:
    - Sessions: `2025-2026`, `2026-2027`
    - Classes, Sections, Shifts, Batches, and Subjects
  - **Demo Faculty & Teachers**: 5 diverse professors and lecturers with Cloudinary portraits and credentials (`teacher@apexacademy.edu` / `teacher123`)
  - **Demo Students**: 6 enrolled students across classes with roll numbers, Cloudinary avatars, attendance records, and fee ledgers (`student@apexacademy.edu` / `student123`)
  - **Website Management Data**: Hero section, Glance, Principal Message, Chairman Message, Heads of Departments, Photo Gallery, FAQs, Contact Information, and Academic Notices all with Cloudinary media URLs.

---

## 🚀 Quick Start

### 1. Seed the Database
```bash
npm run seed:demo
```

### 2. Start the API Server
```bash
npm run dev
```
The server will run on [http://localhost:5000](http://localhost:5000) (routes mounted under `/api/v1`).
