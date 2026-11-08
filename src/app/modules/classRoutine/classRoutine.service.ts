/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../db/db.config';
import AppError from '../../errors/AppError';
import { ENFORCE_ROOM_CONFLICT } from '../../constant/routine';
import { IClassRoutineCreate, IClassRoutineItemCreate, IClassRoutineUpdate } from './classRoutine.type';
import {
  findRealTeacherConflict,
  isSameSubject,
} from './classRoutine.conflict';

/**
 * Resolves subject display names for a set of subject ids in one query.
 * A Subject row belongs to a single AcademicClass, so a subject taught across
 * departments is stored as separate rows - the name (not the id) is what
 * identifies "the same" common subject.
 */
const resolveSubjectNames = async (
  tx: any,
  subjectIds: string[],
): Promise<Map<string, string>> => {
  const uniqueIds = [...new Set(subjectIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();
  const subjects = await tx.subject.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, name: true },
  });
  return new Map(
    subjects.map((subject: any) => [subject.id, subject.name ?? '']),
  );
};

/**
 * Teacher double-booking check with combined-class support.
 *
 * Same teacher + same day + same period + same shift (shift is optional:
 * null/empty on both sides counts as equal, a shift on only one side counts
 * as different shifts and is not a conflict):
 * - Same subject (by normalized NAME - see classRoutine.conflict.ts) AND same
 *   room (trim + lowercase, set on both sides) -> ALLOW (combined class)
 * - Different subject OR different/unconfirmed room -> REJECT with a 409
 *   detailing the conflicting class / subject / room.
 *
 * Batch, section, program, department and year are deliberately NOT part of
 * the rule. `excludeRoutineId` drops the routine being edited so re-saving
 * never collides with itself.
 */
const checkTeacherConflicts = async (
  tx: any,
  items: IClassRoutineItemCreate[],
  targetShiftId?: string | null,
  excludeRoutineId?: string,
) => {
  if (items.length === 0) return;

  const [candidates, wantedSubjectNames] = await Promise.all([
    tx.classRoutineItem.findMany({
      where: {
        OR: items.map((item) => ({
          day: item.day,
          period_no: item.period_no,
          teacher_id: item.teacher_id,
        })),
        ...(excludeRoutineId && {
          class_routine_id: { not: excludeRoutineId },
        }),
      },
      include: {
        teacher: true,
        subject: true,
        classRoutine: {
          include: {
            academicClass: { include: { department: true } },
          },
        },
      },
    }),
    resolveSubjectNames(
      tx,
      items.map((item) => item.subject_id),
    ),
  ]);

  const wanted = items.map((item) => ({
    ...item,
    subjectName: wantedSubjectNames.get(item.subject_id) ?? null,
  }));

  const existing = candidates.map((candidate: any) => ({
    day: candidate.day,
    period_no: candidate.period_no,
    teacher_id: candidate.teacher_id,
    subject_id: candidate.subject_id,
    subjectName: candidate.subject?.name ?? null,
    roomNo: candidate.roomNo ?? null,
    class_routine_id: candidate.class_routine_id,
    shift_id: candidate.classRoutine?.shift_id ?? null,
    // Labels for the error message (resolved below, kept alongside).
    _teacherName: candidate.teacher?.name ?? candidate.teacher_id,
    _subjectName:
      candidate.subject?.name ?? candidate.subject_id ?? '—',
    _classLabel: formatClassLabel(candidate.classRoutine),
    _roomLabel: normalizeRoomNo(candidate.roomNo) ?? '—',
  }));

  const conflict = findRealTeacherConflict({
    wanted,
    existing,
    targetShiftId,
    excludeRoutineId,
  });

  if (conflict) {
    const match = existing.find(
      (candidate: any) =>
        candidate.teacher_id === conflict.conflicting.teacher_id &&
        candidate.day === conflict.conflicting.day &&
        candidate.period_no === conflict.conflicting.period_no &&
        candidate.class_routine_id ===
          conflict.conflicting.class_routine_id &&
        candidate.subject_id === conflict.conflicting.subject_id,
    ) as any | undefined;
    const teacherName = match?._teacherName ?? conflict.conflicting.teacher_id;
    const classLabel = match?._classLabel ?? 'another class';
    const subjectLabel = match?._subjectName ?? conflict.conflicting.subject_id;
    const roomLabel = match?._roomLabel ?? '—';
    throw new AppError(
      409,
      `Teacher "${teacherName}" is already assigned on ${conflict.wanted.day}, period ${conflict.wanted.period_no} in ${classLabel} (Subject: ${subjectLabel}, Room: ${roomLabel}). Use the same subject and room to make it a combined class.`,
    );
  }
};

/**
 * Room number of a cell, normalised the one way the whole app agrees on:
 * trimmed, and "" / whitespace-only collapsed to null. Callers use it both when
 * writing a cell and when deciding whether a room was actually supplied, so a
 * cleared room and a never-set room behave identically.
 */
const normalizeRoomNo = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? '').toString().trim();
  return trimmed ? trimmed : null;
};

/**
 * The room actually stored on a cell. A cell with neither a teacher nor a
 * subject is an empty slot, so any room left in it is dropped rather than
 * saved; everything else keeps the trimmed value, or null when cleared.
 */
const resolveCellRoomNo = (item: IClassRoutineItemCreate): string | null => {
  if (!item.subject_id && !item.teacher_id) return null;
  return normalizeRoomNo(item.roomNo);
};

/** 1 -> "1st", 2 -> "2nd", 11 -> "11th" - for the conflict message. */
const ordinal = (n: number): string => {
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  const mod100 = n % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? 'th' : (suffixes[n % 10] ?? 'th');
  return `${n}${suffix}`;
};

/** SATURDAY -> Saturday */
const formatDay = (day: string): string =>
  day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();

/** "2nd Year - CSE", degrading to whichever part exists. */
const formatClassLabel = (routine: any): string => {
  const label = [
    routine?.academicClass?.class_name,
    routine?.academicClass?.department?.department_name,
  ]
    .filter(Boolean)
    .join(' - ');
  return label || 'another class';
};

/**
 * Room double-booking check - the single place the room rule lives, and the
 * only reader of ENFORCE_ROOM_CONFLICT (see src/app/constant/routine.ts).
 *
 * A room may not be used by two DIFFERENT subjects in the same day + period.
 * The same subject (compared by normalized name - a Subject row belongs to a
 * single AcademicClass, so a common subject has one row per department) in
 * the same room is the same physical combined class, not a conflict, and is
 * exempt. The comparison spans every program, department, year, batch,
 * section and shift, and `excludeRoutineId` drops the routine being edited so
 * re-saving a routine never collides with itself. Room numbers are compared
 * case-insensitively after trimming (" lab 2 " === "Lab 2").
 *
 * Turning the flag off keeps the rooms but drops the exclusivity rule entirely.
 */
const checkRoomConflicts = async (
  tx: any,
  items: IClassRoutineItemCreate[],
  excludeRoutineId?: string,
) => {
  if (!ENFORCE_ROOM_CONFLICT) return;

  // Group the wanted cells by slot so every candidate is fetched in one query
  // instead of one per cell. A cell with a room but no subject is not a real
  // booking, so it is skipped here.
  const wantedBySlot = new Map<string, { item: IClassRoutineItemCreate; roomNo: string }[]>();
  for (const item of items) {
    const roomNo = normalizeRoomNo(item.roomNo);
    if (!roomNo || !item.subject_id) continue;
    const slot = `${item.day}|${item.period_no}`;
    const wanted = wantedBySlot.get(slot);
    if (wanted) {
      wanted.push({ item, roomNo });
    } else {
      wantedBySlot.set(slot, [{ item, roomNo }]);
    }
  }

  if (wantedBySlot.size === 0) return;

  const [candidates, wantedSubjectNames] = await Promise.all([
    tx.classRoutineItem.findMany({
      where: {
        roomNo: { not: null },
        OR: Array.from(wantedBySlot.keys()).map((slot) => {
          const [day, periodNo] = slot.split('|');
          return { day, period_no: Number(periodNo) };
        }),
        ...(excludeRoutineId && {
          class_routine_id: { not: excludeRoutineId },
        }),
      },
      include: {
        subject: true,
        classRoutine: {
          include: {
            academicClass: { include: { department: true } },
          },
        },
      },
    }),
    resolveSubjectNames(
      tx,
      items.map((item) => item.subject_id),
    ),
  ]);

  // `day|period|room` -> bookings already using it (subject kept to exempt the
  // same combined class sharing its room).
  const takenBySlot = new Map<
    string,
    { classLabel: string; subject_id: string; subjectName: string | null }[]
  >();
  for (const candidate of candidates) {
    const room = normalizeRoomNo(candidate.roomNo);
    if (!room) continue;
    const key = `${candidate.day}|${candidate.period_no}|${room.toLowerCase()}`;
    const bookings = takenBySlot.get(key) ?? [];
    bookings.push({
      classLabel: formatClassLabel(candidate.classRoutine),
      subject_id: candidate.subject_id,
      subjectName: candidate.subject?.name ?? null,
    });
    takenBySlot.set(key, bookings);
  }

  for (const [slot, wanted] of wantedBySlot) {
    for (const { item, roomNo } of wanted) {
      const owners =
        takenBySlot.get(`${slot}|${roomNo.toLowerCase()}`) ?? [];
      // Same subject (by name) sharing the room = the same combined class.
      const otherSubjectOwner = owners.find(
        (owner) =>
          !isSameSubject(
            {
              subject_id: item.subject_id,
              subjectName: wantedSubjectNames.get(item.subject_id) ?? null,
            },
            owner,
          ),
      );
      if (otherSubjectOwner) {
        throw new AppError(
          409,
          `Room ${roomNo} is already used on ${formatDay(item.day)}, ${ordinal(
            item.period_no,
          )} period by ${otherSubjectOwner.classLabel} for a different subject.`,
        );
      }
    }
  }
};

const createClassRoutineIntoDB = async (payload: IClassRoutineCreate) => {
  const result = await prisma.$transaction(async (tx) => {
    // Empty string কে null-এ normalize করা হচ্ছে, যাতে Prisma-তে
    // invalid FK value (যেমন "") না যায়
    const academicSectionId = payload.academic_section_id?.trim() || null;
    const batchId = payload.batch_id?.trim() || null;
    const shiftId = payload.shift_id?.trim() || null;

    const academicClass = await tx.academicClass.findUnique({
      where: { id: payload.academic_class_id },
    });

    if (!academicClass) {
      throw new Error('Academic class not found');
    }

    if (academicSectionId) {
      const section = await tx.academicSection.findUnique({
        where: { id: academicSectionId },
      });
      if (!section) {
        throw new Error('Academic section not found');
      }
      // Section টি এই class-এর কিনা চেক
      if (section.class_id !== payload.academic_class_id) {
        throw new Error(
          'Academic section does not belong to the selected class',
        );
      }
    }

    if (batchId) {
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
      });
      if (!batch) {
        throw new Error('Batch not found');
      }
    }

    if (shiftId) {
      const shift = await tx.shift.findUnique({
        where: { id: shiftId },
      });
      if (!shift) {
        throw new Error('Shift not found');
      }
    }

    // Subject / Teacher exist কিনা batch এ চেক (loop এর বদলে findMany, দ্রুত হবে)
    const subjectIds = [
      ...new Set(payload.classRoutineItems.map((item) => item.subject_id)),
    ];
    const teacherIds = [
      ...new Set(payload.classRoutineItems.map((item) => item.teacher_id)),
    ];

    const [subjects, teachers] = await Promise.all([
      tx.subject.findMany({ where: { id: { in: subjectIds } } }),
      tx.teacher.findMany({ where: { id: { in: teacherIds } } }),
    ]);

    if (subjects.length !== subjectIds.length) {
      const foundIds = subjects.map((s: any) => s.id);
      const missingIds = subjectIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Subject(s) not found: ${missingIds.join(', ')}`);
    }

    if (teachers.length !== teacherIds.length) {
      const foundIds = teachers.map((t: any) => t.id);
      const missingIds = teacherIds.filter((id) => !foundIds.includes(id));
      throw new Error(`Teacher(s) not found: ${missingIds.join(', ')}`);
    }

    // Teacher double-booking চেক (অন্য routine-এর সাথে conflict;
    // same subject + same room একই shift-এ হলে combined class হিসেবে allowed)
    await checkTeacherConflicts(tx, payload.classRoutineItems, shiftId);

    // Room double-booking চেক (ENFORCE_ROOM_CONFLICT দিয়ে on/off করা যায়)
    await checkRoomConflicts(tx, payload.classRoutineItems);

    const classRoutine = await tx.classRoutine.create({
      data: {
        academic_class_id: payload.academic_class_id,
        academic_section_id: academicSectionId,
        batch_id: batchId,
        shift_id: shiftId,
        classRoutineItems: {
          createMany: {
            data: payload.classRoutineItems.map((item) => ({
              period_no: item.period_no,
              day: item.day as any,
              subject_id: item.subject_id,
              teacher_id: item.teacher_id,
              roomNo: resolveCellRoomNo(item),
            })),
          },
        },
      },
      include: {
        academicClass: {
          include: {
            department: true,
          },
        },
        academicSection: true,
        batch: true,
        shift: true,
        classRoutineItems: {
          include: {
            subject: true,
            teacher: true,
          },
          orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
        },
      },
    });

    return classRoutine;
  });

  return result;
};

const getAllClassRoutinesFromDB = async () => {
  const classRoutines = await prisma.classRoutine.findMany({
    include: {
      academicClass: {
        include: {
          department: true,
        },
      },
      academicSection: true,
      batch: true,
      shift: true,
      classRoutineItems: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
      },
    },
  });

  return classRoutines;
};

const getClassRoutineByIdFromDB = async (id: string) => {
  const classRoutine = await prisma.classRoutine.findUnique({
    where: { id },
    include: {
      academicClass: {
        include: {
          department: true, // department_name সহ পুরো department object আসবে
        },
      },
      academicSection: true,
      batch: true,
      shift: true,
      classRoutineItems: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
      },
    },
  });

  if (!classRoutine) {
    throw new Error('Class routine not found');
  }

  return classRoutine;
};

const updateClassRoutineInDB = async (
  id: string,
  payload: IClassRoutineUpdate,
) => {
  const result = await prisma.$transaction(async (tx) => {
    const existingRoutine = await tx.classRoutine.findUnique({
      where: { id },
    });

    if (!existingRoutine) {
      throw new Error('Class routine not found');
    }

    // Empty string কে null-এ normalize করা হচ্ছে
    const academicSectionId = payload.academic_section_id?.trim() || null;
    const batchId = payload.batch_id?.trim() || null;
    const shiftId = payload.shift_id?.trim() || null;
    const academicClassId = payload.academic_class_id?.trim() || null;

    if (academicClassId) {
      const academicClass = await tx.academicClass.findUnique({
        where: { id: academicClassId },
      });
      if (!academicClass) {
        throw new Error('Academic class not found');
      }
    }

    if (academicSectionId) {
      const section = await tx.academicSection.findUnique({
        where: { id: academicSectionId },
      });
      if (!section) {
        throw new Error('Academic section not found');
      }
      // Section টি class-এর সাথে মিলে কিনা চেক (যদি class update হয়)
      const targetClassId =
        academicClassId || existingRoutine.academic_class_id;
      if (section.class_id !== targetClassId) {
        throw new Error(
          'Academic section does not belong to the selected class',
        );
      }
    }

    if (batchId) {
      const batch = await tx.batch.findUnique({
        where: { id: batchId },
      });
      if (!batch) {
        throw new Error('Batch not found');
      }
    }

    if (shiftId) {
      const shift = await tx.shift.findUnique({
        where: { id: shiftId },
      });
      if (!shift) {
        throw new Error('Shift not found');
      }
    }

    if (payload.classRoutineItems) {
      const subjectIds = [
        ...new Set(payload.classRoutineItems.map((item) => item.subject_id)),
      ];
      const teacherIds = [
        ...new Set(payload.classRoutineItems.map((item) => item.teacher_id)),
      ];

      const [subjects, teachers] = await Promise.all([
        tx.subject.findMany({ where: { id: { in: subjectIds } } }),
        tx.teacher.findMany({ where: { id: { in: teacherIds } } }),
      ]);

      if (subjects.length !== subjectIds.length) {
        const foundIds = subjects.map((s: any) => s.id);
        const missingIds = subjectIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Subject(s) not found: ${missingIds.join(', ')}`);
      }

      if (teachers.length !== teacherIds.length) {
        const foundIds = teachers.map((t: any) => t.id);
        const missingIds = teacherIds.filter((id) => !foundIds.includes(id));
        throw new Error(`Teacher(s) not found: ${missingIds.join(', ')}`);
      }

      // এই routine নিজেকে বাদ দিয়ে বাকি routine গুলোর সাথে teacher conflict চেক.
      // shift payload-এ না থাকলে existing routine-এর shift-ই target (নিজের সাথে
      // compare-এর জন্য), আর combined class (same subject + same room) allowed.
      const targetShiftId =
        payload.shift_id !== undefined
          ? payload.shift_id?.trim() || null
          : ((existingRoutine as any).shift_id ?? null);
      await checkTeacherConflicts(
        tx,
        payload.classRoutineItems,
        targetShiftId,
        id,
      );

      // একইভাবে room conflict চেক, নিজের routine বাদ দিয়ে
      await checkRoomConflicts(tx, payload.classRoutineItems, id);

      // পুরনো item গুলো মুছে নতুন করে বসানো হচ্ছে
      await tx.classRoutineItem.deleteMany({
        where: { class_routine_id: id },
      });

      await tx.classRoutineItem.createMany({
        data: payload.classRoutineItems.map((item) => ({
          class_routine_id: id,
          period_no: item.period_no,
          day: item.day as any,
          subject_id: item.subject_id,
          teacher_id: item.teacher_id,
          roomNo: resolveCellRoomNo(item),
        })),
      });
    }

    const updatedRoutine = await tx.classRoutine.update({
      where: { id },
      data: {
        academic_class_id: academicClassId || undefined,
        academic_section_id: academicSectionId,
        batch_id: batchId,
        shift_id: shiftId,
      },
      include: {
        academicClass: {
          include: {
            department: true, // department_name সহ পুরো department object আসবে
          },
        },
        academicSection: true,
        batch: true,
        shift: true,
        classRoutineItems: {
          include: {
            subject: true,
            teacher: true,
          },
          orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
        },
      },
    });

    return updatedRoutine;
  });

  return result;
};

const deleteClassRoutineFromDB = async (id: string) => {
  const existingRoutine = await prisma.classRoutine.findUnique({
    where: { id },
  });

  if (!existingRoutine) {
    throw new Error('Class routine not found');
  }

  await prisma.classRoutine.delete({
    where: { id },
  });

  return existingRoutine;
};

const getClassRoutineByTeacherIdFromDB = async (teacherId: string) => {
  const classRoutines = await prisma.classRoutine.findMany({
    where: {
      classRoutineItems: {
        some: {
          teacher_id: teacherId,
        },
      },
    },
    include: {
      academicClass: {
        include: {
          department: true, // department_name সহ পুরো department object আসবে
          // The teacher schedule labels every class card with the program name.
          program: true,
        },
      },
      academicSection: true,
      batch: true,
      shift: true,
      classRoutineItems: {
        where: {
          teacher_id: teacherId,
        },
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
      },
    },
  });

  return classRoutines;
};

/**
 * Student's own routine.
 *
 * The student's "current year" is NOT a mutable field on Student — it lives in
 * the StudentEnrollment history table as the row where `is_primary = true`.
 * The promotion flow (student-promotion.service) closes the old row
 * (`is_primary: false`) and opens a new one for the next class
 * (`is_primary: true`). Resolving the enrollment by that flag — instead of
 * relying on `created_at` ordering — guarantees the post-promotion year is
 * picked even when multiple rows share the same `DATETIME(3)` millisecond.
 *
 * Returns the resolved class label separately so the UI can render a precise
 * empty state ("No routine published yet for 2nd Year") when nothing exists.
 *
 * @param studentId - The student's user ID from JWT
 * @param academicClassIdOverride - Optional override from query param; when
 *   provided, the routine is fetched for this specific class instead of the
 *   student's primary enrollment class. This enables the year-filter dropdown.
 */
const getClassRoutineByStudentIdFromDB = async (
  studentId: string,
  academicClassIdOverride?: string,
) => {
  // If an override is provided, use it directly; otherwise resolve from enrollment
  let academicClassId = academicClassIdOverride;
  let currentClass: string | null = null;

  if (!academicClassId) {
    // Resolve from the student's primary enrollment
    const enrollment = await prisma.studentEnrollment.findFirst({
      where: {
        student_id: studentId,
        is_primary: true, // single source of truth for the student's live year
      },
      orderBy: { created_at: 'desc' }, // tie-break only; is_primary does the real work
      include: {
        academicClass: {
          include: {
            program: true,
            department: true,
          },
        },
      },
    });

    if (!enrollment) {
      return { routines: [], currentClass: null };
    }

    academicClassId = enrollment.academic_class_id;
    currentClass = enrollment.academicClass?.class_name ?? null;
  } else {
    // Look up the class name for the override
    const academicClass = await prisma.academicClass.findUnique({
      where: { id: academicClassId },
      select: { class_name: true },
    });
    currentClass = academicClass?.class_name ?? null;
  }

  // When using override, we need to find the enrollment for this specific class
  // to get section/batch/shift filters
  const enrollmentForClass = await prisma.studentEnrollment.findFirst({
    where: {
      student_id: studentId,
      academic_class_id: academicClassId,
    },
    orderBy: { created_at: 'desc' },
  });


  // Step 1: Fetch routines matching class + batch (batch is always an exact match)
  const whereClause: any = {
    academic_class_id: academicClassId!,
  };
  if (enrollmentForClass?.batch_id) {
    whereClause.batch_id = enrollmentForClass.batch_id;
  }

  const routines = await prisma.classRoutine.findMany({
    where: whereClause,
    include: {
      academicClass: {
        include: {
          department: true,
        },
      },
      academicSection: true,
      batch: true,
      shift: true,
      classRoutineItems: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: [{ day: 'asc' }, { period_no: 'asc' }],
      },
    },
  });

  // Step 2: Filter by section/shift in memory
  // A null section/shift on the routine means "applies to all" — match it.
  const filteredRoutines = routines.filter((routine) => {
    // Section filter: match if routine has the same section OR routine has null section
    if (enrollmentForClass?.academic_section_id) {
      const sectionMatches =
        routine.academic_section_id === enrollmentForClass.academic_section_id ||
        routine.academic_section_id === null;
      if (!sectionMatches) return false;
    }

    // Shift filter: match if routine has the same shift OR routine has null shift
    if (enrollmentForClass?.shift_id) {
      const shiftMatches =
        routine.shift_id === enrollmentForClass.shift_id ||
        routine.shift_id === null;
      if (!shiftMatches) return false;
    }

    return true;
  });

  return {
    routines: filteredRoutines,
    currentClass,
  };
};

export const classRoutineService = {
  createClassRoutineIntoDB,
  getAllClassRoutinesFromDB,
  getClassRoutineByIdFromDB,
  updateClassRoutineInDB,
  deleteClassRoutineFromDB,
  getClassRoutineByTeacherIdFromDB,
  getClassRoutineByStudentIdFromDB,
};
