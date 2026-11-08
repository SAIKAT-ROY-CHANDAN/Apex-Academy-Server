import { IClassRoutineItemCreate } from './classRoutine.type';

/**
 * Pure combined-class conflict helpers (no Prisma dependency, unit-testable).
 *
 * Business rule:
 * - Same teacher + same day + same period + same shift:
 *   - Same subject AND same room -> ALLOW (combined class)
 *   - Different subject OR different room -> REJECT (real conflict)
 * - Only teacher / day / period / shift / subject / room take part in the
 *   rule. Batch, section, program, department and year are deliberately NOT
 *   compared - combined classes span different departments/batches by design.
 * - Shift is optional: null/empty on both sides counts as equal; a shift on
 *   only one side counts as different shifts (not a conflict, never an error
 *   just for being missing).
 * - Room numbers are compared after trim() + lowercase. An empty room on
 *   EITHER side is a real conflict - the same room cannot be confirmed.
 * - Subjects are compared by NORMALIZED NAME (trim + lowercase), not by id:
 *   a Subject row belongs to a single AcademicClass (one department/year), so
 *   a subject taught across departments exists as separate rows with
 *   different ids but the same name. When a name is unavailable on either
 *   side, the comparison falls back to subject_id equality.
 * - The routine being edited is excluded by id (never conflicts with itself).
 */

export interface IConflictCandidate {
  day: string;
  period_no: number;
  teacher_id: string;
  subject_id: string;
  /** Display/resolved name of the subject (may be absent -> id fallback). */
  subjectName?: string | null;
  roomNo?: string | null;
  /** Parent routine id (for self-exclusion). */
  class_routine_id: string;
  /** Parent routine shift (null = unset). */
  shift_id?: string | null;
}

/** Wanted cells additionally carry their resolved subject name. */
export interface IConflictWanted extends IClassRoutineItemCreate {
  subjectName?: string | null;
}

/** Room comparison: trim + lowercase. Empty/whitespace-only collapse to "". */
export const normalizeRoomForCompare = (
  value: string | null | undefined,
): string => (value ?? '').toString().trim().toLowerCase();

/** Subject-name comparison: trim + lowercase. */
export const normalizeSubjectNameForCompare = (
  value: string | null | undefined,
): string => (value ?? '').toString().trim().toLowerCase();

/** Shift comparison: "" is treated as null (unset). */
export const normalizeShiftForCompare = (
  value: string | null | undefined,
): string | null => {
  const trimmed = (value ?? '').toString().trim();
  return trimmed ? trimmed : null;
};

/**
 * True when both sides refer to the same subject: normalized names when both
 * are known, otherwise subject_id equality (same row is always the same
 * subject).
 */
export const isSameSubject = (
  wanted: Pick<IConflictWanted, 'subject_id' | 'subjectName'>,
  existing: Pick<IConflictCandidate, 'subject_id' | 'subjectName'>,
): boolean => {
  const wantedName = normalizeSubjectNameForCompare(wanted.subjectName);
  const existingName = normalizeSubjectNameForCompare(existing.subjectName);
  if (wantedName && existingName) return wantedName === existingName;
  return wanted.subject_id === existing.subject_id;
};

/**
 * True when the wanted cell and an existing booking are the SAME combined
 * class: same subject (by name) AND the same room, with the room set on both
 * sides. Caller must already have matched teacher + day + period + shift.
 */
export const isCombinedClassMatch = (
  wanted: Pick<IConflictWanted, 'subject_id' | 'subjectName' | 'roomNo'>,
  existing: Pick<IConflictCandidate, 'subject_id' | 'subjectName' | 'roomNo'>,
): boolean => {
  if (!isSameSubject(wanted, existing)) return false;
  const wantedRoom = normalizeRoomForCompare(wanted.roomNo);
  const existingRoom = normalizeRoomForCompare(existing.roomNo);
  // An empty room on either side cannot confirm the same room -> conflict.
  if (!wantedRoom || !existingRoom) return false;
  return wantedRoom === existingRoom;
};

export interface IRealConflictInput {
  /** Cells the admin is trying to save (with resolved subject names). */
  wanted: IConflictWanted[];
  /** Existing bookings from OTHER routines (same teacher/day/period query). */
  existing: IConflictCandidate[];
  /** Shift of the routine being saved (null when unset). */
  targetShiftId?: string | null;
  /** Id of the routine being edited (excluded so it never conflicts with itself). */
  excludeRoutineId?: string;
}

export interface IRealConflict {
  wanted: IConflictWanted;
  conflicting: IConflictCandidate;
}

/**
 * Returns the first REAL teacher conflict, or null when every overlap is a
 * valid combined class (or a different shift / the routine itself).
 */
export const findRealTeacherConflict = ({
  wanted,
  existing,
  targetShiftId,
  excludeRoutineId,
}: IRealConflictInput): IRealConflict | null => {
  const targetShift = normalizeShiftForCompare(targetShiftId);

  for (const item of wanted) {
    for (const candidate of existing) {
      if (
        candidate.teacher_id !== item.teacher_id ||
        candidate.day !== item.day ||
        candidate.period_no !== item.period_no
      ) {
        continue;
      }
      if (excludeRoutineId && candidate.class_routine_id === excludeRoutineId) {
        continue;
      }
      // Different shift (including shift set on only one side) -> not a conflict.
      if (normalizeShiftForCompare(candidate.shift_id) !== targetShift) {
        continue;
      }
      // Same subject (by name) + same confirmed room -> valid combined class.
      if (isCombinedClassMatch(item, candidate)) {
        continue;
      }
      return { wanted: item, conflicting: candidate };
    }
  }

  return null;
};
