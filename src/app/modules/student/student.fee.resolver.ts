import type { PrismaClient } from '../../../../generated/prisma/client';

/**
 * Phase 3.1 / FEE_ENROLLMENT_REFACTOR_PLAN.md
 *
 * Server-side enrollment resolution for fee payments. Never trust client input;
 * every write path binds a StudentFeeCollectionItem to the enrollment it belongs
 * to (regular → current `is_primary`; supplementary → the failed SUPPLEMENTARY
 * enrollment that owns `subject_fail_count`).
 */
type EnrollmentResolverClient = Pick<PrismaClient, 'studentEnrollment'>;

export type FeeEnrollmentResolution = {
  id: string | null;
  subject_fail_count: number;
};

export const resolveFeeEnrollmentId = async (
  client: EnrollmentResolverClient,
  studentId: string,
  options: { isSupplementary?: boolean; targetEnrollmentId?: string | null } = {},
): Promise<FeeEnrollmentResolution> => {
  if (options.isSupplementary) {
    if (options.targetEnrollmentId) {
      const explicit = await client.studentEnrollment.findFirst({
        where: {
          id: options.targetEnrollmentId,
          student_id: studentId,
          enrollment_type: 'SUPPLEMENTARY',
        },
        select: { id: true, subject_fail_count: true, enrollment_status: true },
      });
      if (explicit) {
        if ((explicit as any).enrollment_status !== 'WITH_BACKLOG') {
          throw new Error('Supplementary enrollment must be WITH_BACKLOG');
        }
        return { id: explicit.id, subject_fail_count: explicit.subject_fail_count };
      }
      // Explicit ID was supplied but not found/owned — fail fast, never silently fall back to latest
      throw new Error('Supplementary enrollment not found or does not belong to student');
    }
    // The failed (supplementary) enrollment owns the subject_fail_count used to
    // price supplementary items — never read it from the primary enrollment.
    const failed = await client.studentEnrollment.findFirst({
      where: { student_id: studentId, enrollment_type: 'SUPPLEMENTARY' },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: { id: true, subject_fail_count: true },
    });
    if (failed) {
      return { id: failed.id, subject_fail_count: failed.subject_fail_count };
    }
    return { id: null, subject_fail_count: 0 };
  }

  const primary = await client.studentEnrollment.findFirst({
    where: { student_id: studentId, is_primary: true },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    select: { id: true },
  });
  return { id: primary?.id ?? null, subject_fail_count: 0 };
};

/**
 * Legacy NULL fallback rule (plan §2.5): a NULL-enrollment item is treated as
 * belonging to the currently-relevant enrollment, preventing duplicate creation
 * on the same logical slot. Rows bound to OTHER enrollments are excluded so a
 * repeat/promotion student can be billed fresh in the new session.
 */
export const buildEnrollmentScopeFilter = (
  resolvedIds: Array<string | null | undefined>,
): { OR: Array<{ student_enrollment_id: string | null }> } => {
  const or: Array<{ student_enrollment_id: string | null }> = [];
  for (const id of resolvedIds) {
    if (id) or.push({ student_enrollment_id: id });
  }
  or.push({ student_enrollment_id: null });
  return { OR: or };
};

/**
 * Phase 5 read-side scoping (plan §5.1/5.2/5.4). A collection item is "relevant"
 * to the current billing when:
 *   - it is legacy NULL (treated as primary per §13.3),
 *   - it belongs to the current primary enrollment,
 *   - it belongs to a failed (supplementary) enrollment.
 * Rows bound to older/other enrollments (promoted/repeated sessions) are
 * excluded so they can never distort current dues while remaining in history.
 */
export interface EnrollmentScopedItem {
  student_enrollment_id: string | null;
}

export const filterCollectionItemsByEnrollment = <T extends EnrollmentScopedItem>(
  items: T[],
  primaryEnrollmentId: string | null,
  failedEnrollmentIds: string[],
): T[] =>
  items.filter((item) => {
    if (!item.student_enrollment_id) return true;
    if (item.student_enrollment_id === primaryEnrollmentId) return true;
    return failedEnrollmentIds.includes(item.student_enrollment_id);
  });

/**
 * Phase 7.1 fine-grace anchor. The read side gates fines on the primary
 * enrollment's entry date (`entryDate`), so write-side payers must use the same
 * anchor: current primary enrollment created_at, else the student's admission
 * date (legacy students, and admission-time payments where entry == admission).
 */
export const resolveFineAnchor = async (
  client: EnrollmentResolverClient,
  studentId: string,
  fallback: Date,
): Promise<Date> => {
  const primary = await client.studentEnrollment.findFirst({
    where: { student_id: studentId, is_primary: true },
    orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
    select: { created_at: true },
  });
  return primary?.created_at ?? fallback;
};