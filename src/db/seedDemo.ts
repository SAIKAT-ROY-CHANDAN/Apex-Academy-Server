import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './db.config';
import { allPermissions } from '../app/constant/permissions';

async function seedPermissions() {
  const existingPermissions = await prisma.permission.findMany({
    select: { permission: true },
  });
  const existingSet = new Set(existingPermissions.map((p) => p.permission));
  const toCreate = allPermissions.filter((p) => !existingSet.has(p));

  if (toCreate.length > 0) {
    await prisma.permission.createMany({
      data: toCreate.map((p) => ({ permission: p })),
      skipDuplicates: true,
    });
    console.log(`Seeded ${toCreate.length} new permissions.`);
  }
}

export async function seedDemo(options?: { force?: boolean }) {
  if (!options?.force) {
    const existingAdmin = await prisma.administrator.findFirst({
      where: { email: 'admin@apexacademy.edu' },
    });
    const existingHero = await prisma.websiteHeroSection.findFirst();
    if (existingAdmin && existingHero) {
      console.log('✨ Apex Demo database already initialized. Auto-seed skipped.');
      return;
    }
  }

  console.log('🚀 Starting Apex International College Demo Seed...');

  await seedPermissions();

  const allPerms = await prisma.permission.findMany({ select: { id: true } });

  // 1. Roles & Super Admin
  let adminRole = await prisma.role.findFirst({ where: { role_name: 'Super Admin' } });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        role_name: 'Super Admin',
      },
    });
    await prisma.rolePermission.createMany({
      data: allPerms.map((p) => ({ roleId: adminRole!.id, permissionId: p.id })),
      skipDuplicates: true,
    });
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@apexacademy.edu';
  const administrator = await prisma.administrator.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Apex System Administrator',
      password: hashedPassword,
      is_active: true,
    },
    create: {
      name: 'Apex System Administrator',
      email: adminEmail,
      password: hashedPassword,
      is_active: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId: administrator.id },
    update: { roleId: adminRole.id },
    create: { userId: administrator.id, roleId: adminRole.id },
  });
  console.log('✅ Admin configured:', adminEmail);

  // 2. Institution Configuration
  const institutionName = 'Apex International College';
  let institution = await prisma.institutionConfig.findFirst();
  const institutionData = {
    name: institutionName,
    mode: 'COLLEGE_UNIVERSITY' as const,
    email: 'info@apexacademy.edu',
    phone: '+1 (800) 456-APEX',
    address: 'Apex Knowledge Park, 42 Academic Avenue, Metro Central',
    is_setup_completed: true,
    color_scheme: '#0F284E',
    weekend_days: JSON.stringify(['FRIDAY', 'SATURDAY']),
    active_modules: JSON.stringify(['ACADEMICS', 'STUDENT_MANAGEMENT', 'FINANCE', 'HOSTEL', 'LIBRARY']),
    logo: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    login_background: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1920,h_1080/sample.jpg',
  };

  if (!institution) {
    institution = await prisma.institutionConfig.create({
      data: institutionData,
    });
  } else {
    institution = await prisma.institutionConfig.update({
      where: { id: institution.id },
      data: institutionData,
    });
  }
  console.log('✅ Institution Config set to:', institution.name);

  // 3. Academic Sessions
  const sessionNames = ['2025-2026', '2026-2027'];
  const sessions: Record<string, string> = {};
  for (const sName of sessionNames) {
    let session = await prisma.academicSession.findFirst({
      where: { session_name: sName, institution_id: institution.id },
    });
    if (!session) {
      session = await prisma.academicSession.create({
        data: { session_name: sName, institution_id: institution.id },
      });
    }
    sessions[sName] = session.id;
  }

  // 4. Programs
  const programsData = [
    { program_name: 'Higher Secondary Certificate (HSC)', duration_years: 2 },
    { program_name: 'Undergraduate Degree Program', duration_years: 4 },
    { program_name: 'Graduate & Masters Program', duration_years: 2 },
  ];
  const programs: Record<string, string> = {};
  for (const p of programsData) {
    let prog = await prisma.program.findFirst({
      where: { program_name: p.program_name, institution_id: institution.id },
    });
    if (!prog) {
      prog = await prisma.program.create({
        data: {
          program_name: p.program_name,
          duration_years: p.duration_years,
          institution_id: institution.id,
        },
      });
    }
    programs[p.program_name] = prog.id;
  }

  // 5. Departments
  const deptData = [
    { name: 'Computer Science & Engineering', prog: 'Undergraduate Degree Program' },
    { name: 'Business Administration & Economics', prog: 'Undergraduate Degree Program' },
    { name: 'Natural Sciences & Biotechnology', prog: 'Higher Secondary Certificate (HSC)' },
    { name: 'Humanities & Social Sciences', prog: 'Higher Secondary Certificate (HSC)' },
  ];
  const departments: Record<string, string> = {};
  for (const d of deptData) {
    let dept = await prisma.department.findFirst({
      where: { department_name: d.name, institution_id: institution.id },
    });
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          department_name: d.name,
          institution_id: institution.id,
          program_id: programs[d.prog],
        },
      });
    }
    departments[d.name] = dept.id;
  }

  // 6. Designations
  const designationList = [
    'Principal',
    'Vice Principal',
    'Professor & Head of Department',
    'Associate Professor',
    'Senior Lecturer',
    'Academic Counselor',
  ];
  const designations: Record<string, string> = {};
  for (const desName of designationList) {
    let des = await prisma.designation.findFirst({ where: { name: desName } });
    if (!des) {
      des = await prisma.designation.create({ data: { name: desName } });
    }
    designations[desName] = des.id;
  }

  // 7. Shifts
  const shiftList = [
    { name: 'Morning Shift', start: new Date('1970-01-01T08:00:00.000Z'), end: new Date('1970-01-01T13:00:00.000Z') },
    { name: 'Day Shift', start: new Date('1970-01-01T11:00:00.000Z'), end: new Date('1970-01-01T16:30:00.000Z') },
  ];
  const shifts: Record<string, string> = {};
  for (const sh of shiftList) {
    let shift = await prisma.shift.findFirst({ where: { name: sh.name } });
    if (!shift) {
      shift = await prisma.shift.create({
        data: { name: sh.name, start_time: sh.start, end_time: sh.end },
      });
    }
    shifts[sh.name] = shift.id;
  }

  // 8. Batches
  const batchList = ['Batch 2025 (24th)', 'Batch 2026 (25th)', 'Batch 2027 (26th)'];
  const batches: Record<string, string> = {};
  for (const bName of batchList) {
    let batch = await prisma.batch.findFirst({ where: { batch_name: bName } });
    if (!batch) {
      batch = await prisma.batch.create({ data: { batch_name: bName } });
    }
    batches[bName] = batch.id;
  }

  // 9. Academic Classes
  const classList = [
    { name: 'HSC 1st Year (Science)', prog: 'Higher Secondary Certificate (HSC)', dept: 'Natural Sciences & Biotechnology', level: 11 },
    { name: 'HSC 2nd Year (Science)', prog: 'Higher Secondary Certificate (HSC)', dept: 'Natural Sciences & Biotechnology', level: 12 },
    { name: 'Undergraduate Year 1 (CSE)', prog: 'Undergraduate Degree Program', dept: 'Computer Science & Engineering', level: 1 },
    { name: 'Undergraduate Year 2 (BBA)', prog: 'Undergraduate Degree Program', dept: 'Business Administration & Economics', level: 2 },
  ];
  const academicClasses: Record<string, string> = {};
  for (const c of classList) {
    let cls = await prisma.academicClass.findFirst({
      where: { class_name: c.name, program_id: programs[c.prog], department_id: departments[c.dept] },
    });
    if (!cls) {
      cls = await prisma.academicClass.create({
        data: {
          class_name: c.name,
          program_id: programs[c.prog],
          department_id: departments[c.dept],
          class_level: c.level,
        },
      });
    }
    academicClasses[c.name] = cls.id;
  }

  // 10. Academic Sections
  const sectionsList = ['Section Alpha', 'Section Beta'];
  const sections: Record<string, string> = {};
  for (const clsName of Object.keys(academicClasses)) {
    for (const secName of sectionsList) {
      const classId = academicClasses[clsName];
      let sec = await prisma.academicSection.findFirst({
        where: { section_name: secName, class_id: classId },
      });
      if (!sec) {
        sec = await prisma.academicSection.create({
          data: { section_name: secName, class_id: classId },
        });
      }
      sections[`${clsName}_${secName}`] = sec.id;
    }
  }

  // 11. Subjects
  const subjectList = [
    { name: 'Advanced Mathematics', cls: 'HSC 1st Year (Science)' },
    { name: 'Applied Physics & Mechanics', cls: 'HSC 1st Year (Science)' },
    { name: 'Computer Programming & C++', cls: 'Undergraduate Year 1 (CSE)' },
    { name: 'Data Structures & Algorithms', cls: 'Undergraduate Year 1 (CSE)' },
    { name: 'Principles of Management', cls: 'Undergraduate Year 2 (BBA)' },
  ];
  for (const sub of subjectList) {
    const classId = academicClasses[sub.cls];
    const exists = await prisma.subject.findFirst({
      where: { name: sub.name, class_id: classId },
    });
    if (!exists) {
      await prisma.subject.create({
        data: { name: sub.name, class_id: classId },
      });
    }
  }

  // 12. Teachers Seeding (with Cloudinary images)
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const demoTeachers = [
    {
      name: 'Prof. Dr. Marcus Sterling',
      email: 'teacher@apexacademy.edu',
      phone: '+1 (555) 701-0001',
      gender: 'MALE' as const,
      qualification: 'PHD' as const,
      department: 'Natural Sciences & Biotechnology',
      shift: 'Morning Shift',
      designation: 'Professor & Head of Department',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/smiling_man.jpg',
    },
    {
      name: 'Prof. Elena Vance',
      email: 'elena.vance@apexacademy.edu',
      phone: '+1 (555) 701-0002',
      gender: 'FEMALE' as const,
      qualification: 'MASTERS' as const,
      department: 'Computer Science & Engineering',
      shift: 'Morning Shift',
      designation: 'Professor & Head of Department',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/lady.jpg',
    },
    {
      name: 'Prof. Sarah Jenkins',
      email: 'sarah.jenkins@apexacademy.edu',
      phone: '+1 (555) 701-0003',
      gender: 'FEMALE' as const,
      qualification: 'MASTERS' as const,
      department: 'Business Administration & Economics',
      shift: 'Day Shift',
      designation: 'Associate Professor',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/woman.jpg',
    },
    {
      name: 'Dr. David Miller',
      email: 'david.miller@apexacademy.edu',
      phone: '+1 (555) 701-0004',
      gender: 'MALE' as const,
      qualification: 'PHD' as const,
      department: 'Natural Sciences & Biotechnology',
      shift: 'Day Shift',
      designation: 'Senior Lecturer',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/actor.jpg',
    },
    {
      name: 'Dr. Rachel Adams',
      email: 'rachel.adams@apexacademy.edu',
      phone: '+1 (555) 701-0005',
      gender: 'FEMALE' as const,
      qualification: 'PHD' as const,
      department: 'Humanities & Social Sciences',
      shift: 'Morning Shift',
      designation: 'Senior Lecturer',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/front_face.jpg',
    },
  ];

  for (const t of demoTeachers) {
    const tData = {
      full_name: t.name,
      email: t.email,
      phone: t.phone,
      password: teacherPassword,
      photo: t.photo,
      gender: t.gender,
      last_qualification: t.qualification,
      academic_document: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      teacher_type: 'REGULAR' as const,
      designation_id: designations[t.designation] || designations['Senior Lecturer'],
      is_active: true,
      department_id: departments[t.department],
      shift_id: shifts[t.shift],
    };
    await prisma.teacher.upsert({
      where: { email: t.email },
      update: tData,
      create: tData,
    });
    console.log(`👨‍🏫 Teacher seeded: ${t.name} (${t.email})`);
  }

  // 13. Students Seeding (with Cloudinary images)
  const studentPassword = await bcrypt.hash('student123', 10);
  const demoStudents = [
    {
      name: 'Alexander Wright',
      email: 'student@apexacademy.edu',
      phone: '+1 (555) 801-0001',
      father_phone: '+1 (555) 801-9001',
      gender: 'MALE' as const,
      roll: '101',
      class: 'HSC 1st Year (Science)',
      section: 'Section Alpha',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/samples/people/boy-snow-hoodie.jpg',
    },
    {
      name: 'Sophia Martinez',
      email: 'sophia.martinez@apexacademy.edu',
      phone: '+1 (555) 801-0002',
      father_phone: '+1 (555) 801-9002',
      gender: 'FEMALE' as const,
      roll: '102',
      class: 'HSC 1st Year (Science)',
      section: 'Section Alpha',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/samples/landscapes/girl-urban-view.jpg',
    },
    {
      name: 'Liam Chen',
      email: 'liam.chen@apexacademy.edu',
      phone: '+1 (555) 801-0003',
      father_phone: '+1 (555) 801-9003',
      gender: 'MALE' as const,
      roll: '201',
      class: 'Undergraduate Year 1 (CSE)',
      section: 'Section Alpha',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/smiling_man.jpg',
    },
    {
      name: 'Emily Davis',
      email: 'emily.davis@apexacademy.edu',
      phone: '+1 (555) 801-0004',
      father_phone: '+1 (555) 801-9004',
      gender: 'FEMALE' as const,
      roll: '202',
      class: 'Undergraduate Year 2 (BBA)',
      section: 'Section Alpha',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/woman.jpg',
    },
    {
      name: 'Noah Patel',
      email: 'noah.patel@apexacademy.edu',
      phone: '+1 (555) 801-0005',
      father_phone: '+1 (555) 801-9005',
      gender: 'MALE' as const,
      roll: '103',
      class: 'HSC 2nd Year (Science)',
      section: 'Section Beta',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/front_face.jpg',
    },
    {
      name: 'Olivia Kim',
      email: 'olivia.kim@apexacademy.edu',
      phone: '+1 (555) 801-0006',
      father_phone: '+1 (555) 801-9006',
      gender: 'FEMALE' as const,
      roll: '203',
      class: 'Undergraduate Year 1 (CSE)',
      section: 'Section Beta',
      photo: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_400,h_400,g_face,q_auto/lady.jpg',
    },
  ];

  for (const s of demoStudents) {
    const sData = {
      name: s.name,
      email: s.email,
      password: studentPassword,
      photo: s.photo,
      status: 'APPROVED' as const,
      gender: s.gender,
      religion: 'ISLAM' as const,
      is_residential: false,
      student_phone: s.phone,
      father_phone: s.father_phone,
      father_name: `${s.name.split(' ')[1]} Senior`,
      mother_name: 'Mrs. ' + s.name.split(' ')[1],
      sub_district: 'Metro Central',
      district: 'Apex District',
      is_active: true,
    };
    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: sData,
      create: sData,
    });

    // Enrollment
    const clsId = academicClasses[s.class];
    const secId = sections[`${s.class}_${s.section}`];
    let enrollment = await prisma.studentEnrollment.findFirst({
      where: { student_id: student.id },
    });
    if (!enrollment) {
      await prisma.studentEnrollment.create({
        data: {
          student_id: student.id,
          academic_session_id: sessions['2026-2027'],
          academic_class_id: clsId,
          academic_section_id: secId,
          batch_id: batches['Batch 2026 (25th)'],
          shift_id: shifts['Morning Shift'],
          roll_number: s.roll,
          registration_number: `REG-2026-${s.roll}`,
          enrollment_status: 'ACTIVE',
          enrollment_type: 'REGULAR',
          is_primary: true,
        },
      });
    }
    console.log(`🎓 Student seeded: ${s.name} (${s.email})`);
  }

  // 14. Website Content (Hero, Glance, Principal, Chairman, Gallery, FAQs, Contact)
  await prisma.websiteHeroSection.deleteMany();
  await prisma.websiteHeroSection.create({
    data: {
      heading: 'Empowering Future Leaders with Excellence & Innovation',
      subHeading:
        'Welcome to Apex International College. We offer premier academic curricula, world-class research laboratories, and a global learning community dedicated to scholarly distinction.',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=85&w=1920&auto=format&fit=crop',
    },
  });

  await prisma.websiteCollegeAtGlance.deleteMany();
  await prisma.websiteCollegeAtGlance.create({
    data: {
      heading: 'Apex International College at a Glance',
      description:
        'Established in 1998, Apex International College has been a beacon of academic distinction and cultural vibrancy. Spanning a 25-acre modern eco-campus, we offer accredited HSC, Undergraduate, and Postgraduate programs with international credit recognition.',
      imageUrl1: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop',
      imageUrl4: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    },
  });

  await prisma.websitePrincipalMessage.deleteMany();
  await prisma.websitePrincipalMessage.create({
    data: {
      name: 'Prof. Dr. Victoria Vance',
      message:
        'Education is the most transformative investment in human potential. At Apex International College, our faculty and mentors are dedicated to inspiring each scholar to achieve academic distinction, embrace ethical leadership, and make meaningful contributions to our world.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_600,h_600,g_face,q_auto/samples/people/smiling-man.jpg',
      facebookUrl: 'https://facebook.com',
      linkedinUrl: 'https://linkedin.com',
    },
  });

  await prisma.websiteChairmanMessage.deleteMany();
  await prisma.websiteChairmanMessage.create({
    data: {
      name: 'Dr. Arthur Pendelton',
      message:
        'On behalf of the Governing Council, I welcome all prospective students and parents to Apex International College. We combine time-honored academic rigor with future-ready technological empowerment to foster visionary leaders for tomorrow.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_600,h_600,g_face,q_auto/actor.jpg',
      facebookUrl: 'https://facebook.com',
      linkedinUrl: 'https://linkedin.com',
    },
  });

  await prisma.websiteHeadOfDepartment.deleteMany();
  const headOfDepts = [
    {
      name: 'Prof. Elena Vance',
      designation: 'Head of Department',
      departmentName: 'Computer Science & Engineering',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/lady.jpg',
    },
    {
      name: 'Prof. Dr. Marcus Sterling',
      designation: 'Head of Department',
      departmentName: 'Natural Sciences & Biotechnology',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/smiling_man.jpg',
    },
    {
      name: 'Prof. Sarah Jenkins',
      designation: 'Head of Department',
      departmentName: 'Business Administration & Economics',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/woman.jpg',
    },
    {
      name: 'Dr. Rachel Adams',
      designation: 'Head of Department',
      departmentName: 'Humanities & Social Sciences',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_thumb,w_500,h_500,g_face,q_auto/front_face.jpg',
    },
  ];
  for (const hod of headOfDepts) {
    await prisma.websiteHeadOfDepartment.create({ data: hod });
  }

  await prisma.websiteGalleryImage.deleteMany();
  const galleryImages = [
    {
      title: 'Modern Campus Architecture',
      description: 'Our iconic central academic tower and landscaped quadrangle.',
      imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Annual Convocation Ceremony',
      description: 'Celebrating graduation and academic milestones for the Class of 2026.',
      imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Advanced STEM & Robotics Lab',
      description: 'Cutting-edge scientific computing, AI research, and biotechnology facilities.',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Sports & Athletics Pavilion',
      description: 'Inter-college championships held at our Olympic-standard sports grounds.',
      imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Student Innovation & Study Hub',
      description: 'Collaborative workspaces and technology-enabled learning centers.',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
    },
    {
      title: 'Central Academic Library',
      description: 'Over 50,000 volumes, international academic journals, and digital research terminals.',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
    },
  ];
  for (const g of galleryImages) {
    await prisma.websiteGalleryImage.create({ data: g });
  }

  await prisma.websiteCtaBanner.deleteMany();
  await prisma.websiteCtaBanner.create({
    data: {
      heading: 'Admissions Open for Academic Session 2026-2027',
      subHeading: 'Join a community of innovators and achievers. Merit-based scholarships available for eligible applicants.',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_1600,h_600,q_auto/samples/landscapes/nature-mountains.jpg',
    },
  });

  await prisma.websiteFaq.deleteMany();
  const faqs = [
    {
      question: 'What academic programs are offered at Apex International College?',
      answer:
        'We offer accredited Higher Secondary Certificate (HSC) programs in Science and Business, along with four-year Bachelor degrees in Computer Science & Engineering (CSE) and Business Administration (BBA).',
    },
    {
      question: 'How do I apply for online admission?',
      answer:
        'Applications can be submitted directly through our website via the "Online Admission" portal. Upload your academic transcripts, national ID/birth certificate, and passport photo.',
    },
    {
      question: 'Are merit-based scholarships and financial aid available?',
      answer:
        'Yes! Apex International College awards merit scholarships covering up to 100% of tuition for exceptional academic performance, national STEM Olympiad winners, and sports champions.',
    },
    {
      question: 'What hostel and residential accommodations are provided?',
      answer:
        'Our secure residential campus features separate modern hostels for male and female students with high-speed Wi-Fi, dining facilities, 24/7 security, and dedicated study halls.',
    },
  ];
  for (const f of faqs) {
    await prisma.websiteFaq.create({ data: f });
  }

  await prisma.websiteContactUs.deleteMany();
  await prisma.websiteContactUs.create({
    data: {
      heading: 'Contact Apex International College',
      subHeading: 'Have questions or need assistance? Our admissions advisors and student counselors are here for you.',
      phone: '+1 (800) 456-APEX',
      email: 'admissions@apexacademy.edu',
      location: 'Apex Knowledge Park, 42 Academic Avenue, Metro Central',
      workingHours: 'Monday - Friday: 8:00 AM - 5:00 PM',
      facebookUrl: 'https://facebook.com',
    },
  });

  await prisma.websiteFooterBranding.deleteMany();
  await prisma.websiteFooterBranding.create({
    data: {
      heading: 'Apex International College',
      subHeading: 'Empowering Minds, Shaping the Future. A premier institution for higher secondary and undergraduate education.',
      description: 'Dedicated to cultivating scholarly rigor, moral integrity, and technological innovation.',
      copyrightText: 'Apex International College',
      footerImage: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_500,q_auto/sample.jpg',
      brandingImage: 'https://res.cloudinary.com/demo/image/upload/c_fill,w_800,h_500,q_auto/sample.jpg',
    },
  });

  // 15. Academic Notices
  await prisma.academicNotice.deleteMany();
  const notices = [
    {
      title: 'Admission Schedule & Interview Dates for Academic Session 2026-2027',
      noticeType: 'ADMISSION_NOTICE' as const,
      pdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
    {
      title: 'Orientation Ceremony for Freshmen Batch of Undergraduate Programs',
      noticeType: 'GENERAL_NOTICE' as const,
      pdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
    {
      title: 'HSC Pre-Board Examination Routine & Guidelines Announced',
      noticeType: 'HSC_NOTICE' as const,
      pdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
    {
      title: 'Annual Science Fair & Robotics Exhibition Registration Open',
      noticeType: 'UPDATE_NEWS' as const,
      pdfUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    },
  ];
  for (const n of notices) {
    await prisma.academicNotice.create({ data: n });
  }

  // 16. Seed Student Attendance & Fees for rich dashboard stats
  await prisma.studentAttendance.deleteMany();
  const teacherLead = await prisma.teacher.findFirst();
  const allDemoStudents = await prisma.student.findMany();
  for (const st of allDemoStudents) {
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      await prisma.studentAttendance.create({
        data: {
          student_id: st.id,
          teacher_id: teacherLead!.id,
          attendance_status: (i === 2 && st.name.includes('Sophia')) ? 'ABSENT' : 'PRESENT',
          attendance_date: d,
        },
      });
    }
  }

  const allEnrollments = await prisma.studentEnrollment.findMany();
  for (const en of allEnrollments) {
    await prisma.studentFee.upsert({
      where: { student_enrollment_id: en.id },
      update: { paid_amount: 15000, due_amount: 2500, scholarship_amount: 5000 },
      create: {
        student_enrollment_id: en.id,
        paid_amount: 15000,
        due_amount: 2500,
        scholarship_amount: 5000,
      },
    });
  }
  console.log('📊 Student Attendances and Fees seeded for analytics!');

  console.log('🎉 Apex International College Demo Seed Completed Successfully!');
}

if (
  typeof require !== 'undefined' &&
  require.main === module
) {
  seedDemo({ force: true })
    .catch((e) => {
      console.error('❌ Demo seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
