import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  findRealTeacherConflict,
  isCombinedClassMatch,
  isSameSubject,
  normalizeRoomForCompare,
  normalizeSubjectNameForCompare,
} from './classRoutine.conflict';

const wanted = (
  overrides: Record<string, unknown> = {},
): Parameters<typeof findRealTeacherConflict>[0]['wanted'][number] =>
  ({
    day: 'SATURDAY',
    period_no: 5,
    teacher_id: 't1',
    subject_id: 's1',
    subjectName: 'Mathematics',
    roomNo: '101',
    ...overrides,
  }) as never;

const candidate = (
  overrides: Record<string, unknown> = {},
): Parameters<typeof findRealTeacherConflict>[0]['existing'][number] =>
  ({
    day: 'SATURDAY',
    period_no: 5,
    teacher_id: 't1',
    subject_id: 's1',
    subjectName: 'Mathematics',
    roomNo: '101',
    class_routine_id: 'routine-B',
    shift_id: null,
    ...overrides,
  }) as never;

describe('findRealTeacherConflict (combined-class rule)', () => {
  it('allows same teacher/day/period/shift with same subject name AND same room', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [candidate()],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('allows the same common subject stored as separate rows per department (different ids, same name)', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted({ subject_id: 's-dept-A', subjectName: 'Physics' })],
      existing: [
        candidate({ subject_id: 's-dept-B', subjectName: ' physics ' }),
      ],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('rejects same subject name but different room', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted({ roomNo: '102' })],
      existing: [candidate({ roomNo: '101' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.notEqual(result, null);
  });

  it('rejects same room but different subject name', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted({ subjectName: 'Chemistry' })],
      existing: [candidate({ subjectName: 'Mathematics' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.notEqual(result, null);
  });

  it('rejects when the wanted room is empty (same room cannot be confirmed)', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted({ roomNo: '' })],
      existing: [candidate({ roomNo: '101' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.notEqual(result, null);
  });

  it('rejects when the existing room is empty (same room cannot be confirmed)', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted({ roomNo: '101' })],
      existing: [candidate({ roomNo: null })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.notEqual(result, null);
  });

  it('rejects when both rooms are empty', () => {
    assert.equal(
      isCombinedClassMatch(
        { subject_id: 's1', subjectName: 'Mathematics', roomNo: '' },
        { subject_id: 's1', subjectName: 'Mathematics', roomNo: '' },
      ),
      false,
    );
  });

  it('ignores different shift (not a conflict)', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [candidate({ shift_id: 'shift-2' })],
      targetShiftId: 'shift-1',
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('treats shift set on only one side as different shifts (not a conflict)', () => {
    const onlyTarget = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [candidate({ shift_id: null })],
      targetShiftId: 'shift-1',
      excludeRoutineId: 'routine-A',
    });
    assert.equal(onlyTarget, null);

    const onlyExisting = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [candidate({ shift_id: 'shift-1' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.equal(onlyExisting, null);
  });

  it('treats null/empty shift on both sides as equal (combined allowed)', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [candidate({ shift_id: null })],
      targetShiftId: '',
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('ignores its own routine records when editing', () => {
    const result = findRealTeacherConflict({
      wanted: [
        wanted({ subject_id: 's-other', subjectName: 'Other', roomNo: '999' }),
      ],
      existing: [candidate({ class_routine_id: 'routine-A' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('treats room with extra spaces / different casing as equal', () => {
    assert.equal(normalizeRoomForCompare('  Lab 2 '), 'lab 2');
    const result = findRealTeacherConflict({
      wanted: [wanted({ subjectName: 'Lab', roomNo: '  LAB 2 ' })],
      existing: [candidate({ subjectName: 'lab', roomNo: 'lab 2' })],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.equal(result, null);
  });

  it('compares subject names case-insensitively after trimming', () => {
    assert.equal(
      normalizeSubjectNameForCompare('  MATHEMATICS '),
      'mathematics',
    );
    assert.equal(
      isSameSubject(
        { subject_id: 'a', subjectName: 'Mathematics' },
        { subject_id: 'b', subjectName: ' mathematics ' },
      ),
      true,
    );
  });

  it('falls back to subject_id when a name is unavailable', () => {
    assert.equal(
      isSameSubject(
        { subject_id: 's1', subjectName: null },
        { subject_id: 's1', subjectName: null },
      ),
      true,
    );
    assert.equal(
      isSameSubject(
        { subject_id: 's1', subjectName: null },
        { subject_id: 's2', subjectName: null },
      ),
      false,
    );
  });

  it('still rejects when the first overlap is combined but a second one is real', () => {
    const result = findRealTeacherConflict({
      wanted: [wanted()],
      existing: [
        candidate({ class_routine_id: 'routine-B' }),
        candidate({
          class_routine_id: 'routine-C',
          subject_id: 's-other',
          subjectName: 'Chemistry',
          roomNo: '999',
        }),
      ],
      targetShiftId: null,
      excludeRoutineId: 'routine-A',
    });
    assert.notEqual(result, null);
    assert.equal(
      (result as NonNullable<typeof result>).conflicting.class_routine_id,
      'routine-C',
    );
  });
});
