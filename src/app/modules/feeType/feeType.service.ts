import prisma from '../../../db/db.config';
import {
  FeeItemType,
  Month,
  Prisma,
  EnrollmentType,
  EnrollmentStatus,
  Fee_Assign_FOR,
} from '../../../../generated/prisma/client';
import { calculatePeriodFine } from '../../utils/fineCalculation';
import {
  buildPrismaQuery,
  calculatePaginationMeta,
  QueryParams,
} from '../../builders/prismaBuilderQuery';
import { IFeeTypeCreate, IFeeTypeUpdate } from './feeType.type';
import { filterCollectionItemsByEnrollment } from '../student/student.fee.resolver';

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY BREAKDOWN HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const MONTH_INDEX: Record<Month, number> = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
};

const MONTH_NAME_BY_INDEX = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

type FeePeriodStatus = 'PAID' | 'PARTIAL' | 'DUE';

/** Returns true when `monthIdx` (0-11, 0 = January) falls within a fee range
 * that may wrap across the year boundary (e.g. JULY → JUNE). */
const isMonthInFeeRange = (
  monthIdx: number,
  startIdx: number,
  endIdx: number,
): boolean => {
  if (startIdx <= endIdx) {
    return monthIdx >= startIdx && monthIdx <= endIdx;
  }
  // Wrapping academic cycle, e.g. JULY(6) → JUNE(5)
  return monthIdx >= startIdx || monthIdx <= endIdx;
};

/** Fine-grace rule (absolute months, 0 = Jan 0000):
 *  A period becomes fine-eligible once one calendar month has passed since the
 *  LATER of (the period itself, the student's entry into the current class).
 *  - The current month is never fined.
 *  - Back-billed pre-entry months stay fine-free until one month after entry.
 *  `entryAbs` = absolute month of latest promotion / enrollment / created_at. */
const isPeriodFineEligible = (
  periodAbs: number,
  currentAbs: number,
  entryAbs: number | null,
): boolean => {
  const eligibleFrom = Math.max(periodAbs + 1, (entryAbs ?? periodAbs) + 1);
  return currentAbs >= eligibleFrom;
};

export interface MonthlyBreakdownFeeItem {
  id: string;
  name: string;
  amount: number;
  amount_every_subject?: number | null;
  fee_assign_for: Fee_Assign_FOR;
  FeeItemType: FeeItemType;
  isFine: boolean;
  feeStartMonth: Month | null;
  feeEndMonth: Month | null;
  subject_fail_count?: number; // For supplementary fees: fail count from failed enrollment
  supplementary_class_name?: string; // For supplementary fees: academic class name
  fee_type_id?: string; // For supplementary fees: the fee type ID from the failed year's class
  source_enrollment_id?: string | null; // For supplementary: the specific backlog enrollment that generated this fee
}

export interface MonthlyBreakdownFeeType {
  id: string;
  name: string;
  class_id: string;
  feeItems: MonthlyBreakdownFeeItem[];
}

export interface MonthlyBreakdownPaymentItem {
  created_at: Date;
  paid_amount: number | null;
  discount_amount: number | null;
  line_total_amount: number | null;
  fine_amount: number | null;
  fee_month: Month | null;
  fee_year: number | null;
  feeItem: {
    id: string;
    isFine: boolean;
    payment_start_date: number | null;
    last_payment_date: number | null;
    everydayFine_amount: number | null;
    feeStartMonth: Month | null;
    feeEndMonth: Month | null;
    fee_assign_for: Fee_Assign_FOR;
    amount_every_subject?: number | null;
  };
}

export interface MonthlyBreakdownItem {
  feeItemId: string;
  feeItemName: string;
  feeTypeId?: string | null;
  feeTypeName?: string | null;
  amount: number;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;
  status: FeePeriodStatus;
}

export interface MonthlyBreakdownPeriod {
  year: number;
  month: (typeof MONTH_NAME_BY_INDEX)[number];
  monthNumber: number;
  paymentCount: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;
  status: FeePeriodStatus;
  fineEligible: boolean;
  paymentDueDuringMonth: (typeof MONTH_NAME_BY_INDEX)[number];
  paymentDueYear: number;
  items: MonthlyBreakdownItem[];
}

export interface MonthlyBreakdownResult {
  monthlyBreakdown: MonthlyBreakdownPeriod[];
  totalPayable: number;
  totalPaid: number;
  totalDiscount: number;
  totalFine: number;
  dueAmount: number;
  billingStartYear: number;
  billingStartMonth: number;
  billingMonths: number;
  monthlyFeeAmount: number;
}

/**
 * Builds a month-by-month fee/payment breakdown for a student.
 *
 * Business rules:
 * 1. PER-ITEM CYCLES: every Monthly fee item owns its own active cycle,
 *    anchored to ITS OWN feeStartMonth — the most recent occurrence ≤ today.
 *    Crossing ranges (e.g. JUN → FEB, APR → JAN) extend into the following
 *    calendar year. There is NO shared global window and NO session-year
 *    anchoring; the calendar alone decides which cycle is active.
 * 2. Due periods per item run from its cycle anchor through
 *    min(cycle end, current month) — future months carry no obligation yet.
 *    The current month IS included as due.
 * 3. OneTime items with a start month apply once, at their own cycle anchor;
 *    OneTime without months are handled separately as single payments.
 * 4. Payments (StudentFeeCollectionItem) are attributed by their STORED
 *    fee_month/fee_year slots, so early/late payments land on the right month.
 * 5. FINE GRACE: a period becomes fine-eligible one calendar month after the
 *    later of (the period itself, `entryDate` = entry into the current class,
 *    taken from the latest immutable StudentPromotion snapshot when present).
 *    Current month is never fined; back-billed pre-entry months are fine-free
 *    until one month after entry.
 * 6. Each payment is bucketed to its (fee_year, fee_month, feeItemId) slot.
 * 7. SUPPLEMENTARY fees: OneTime exam fees per subject (amount_every_subject × subjectFailCount)
 */
export const buildMonthlyBreakdown = ({
  entryDate,
  applicableFeeTypes,
  collectionItems,
  supplementaryItems = [],
}: {
  entryDate?: Date | null;
  applicableFeeTypes: MonthlyBreakdownFeeType[];
  collectionItems: MonthlyBreakdownPaymentItem[];
  supplementaryItems?: MonthlyBreakdownFeeItem[];
}): MonthlyBreakdownResult => {
  // ── Collect the unique applicable fee items (dedupe by id) ────────────────
  // Supplementary items are deduped by enrollment+fee_item to allow repeated attempts
  const feeItemMap = new Map<string, MonthlyBreakdownFeeItem>();
  const feeTypeByItemId = new Map<string, { id: string; name: string }>();
  for (const ft of applicableFeeTypes) {
    for (const item of ft.feeItems) {
      if (!feeItemMap.has(item.id)) feeItemMap.set(item.id, item);
      if (!feeTypeByItemId.has(item.id)) {
        feeTypeByItemId.set(item.id, { id: ft.id, name: ft.name });
      }
    }
  }

  // Add supplementary items with calculated amounts (amount_every_subject × subject_fail_count per item)
  for (const suppItem of supplementaryItems) {
    const calculatedAmount =
      (suppItem.amount_every_subject ?? 0) * (suppItem.subject_fail_count ?? 0);
    const suppItemWithAmount: MonthlyBreakdownFeeItem = {
      ...suppItem,
      amount: calculatedAmount,
      // Supplementary items are always OneTime with no month range
      FeeItemType: 'OneTime' as FeeItemType,
      feeStartMonth: null,
      feeEndMonth: null,
      supplementary_class_name: suppItem.supplementary_class_name, // Include class name
    };
    const suppKey = suppItem.source_enrollment_id
      ? `${suppItem.id}:${suppItem.source_enrollment_id}`
      : suppItem.id;
    if (!feeItemMap.has(suppKey)) feeItemMap.set(suppKey, suppItemWithAmount);
    if (!feeTypeByItemId.has(suppItem.id)) {
      // Find fee type for supplementary item (from previous class)
      feeTypeByItemId.set(suppItem.id, { id: '', name: 'Supplementary' });
    }
  }

  const feeItems = [...feeItemMap.values()];

  // monthlyFeeAmount is only for Monthly items — OneTime items are counted separately
  const monthlyFeeAmount = feeItems
    .filter((item) => item.FeeItemType === 'Monthly')
    .reduce((sum, item) => sum + item.amount, 0);

  if (!feeItems.length) {
    return {
      monthlyBreakdown: [],
      totalPayable: 0,
      totalPaid: 0,
      totalDiscount: 0,
      totalFine: 0,
      dueAmount: 0,
      billingStartYear: new Date().getFullYear(),
      billingStartMonth: 1,
      billingMonths: 0,
      monthlyFeeAmount: 0,
    };
  }

  // ── Per-item active cycles ─────────────────────────────────────────────────
  // Every item is anchored to ITS OWN feeStartMonth — the most recent
  // occurrence ≤ today. Crossing ranges extend into the next calendar year.
  // Due periods run from the anchor through min(cycle end, current month);
  // future months carry no obligation yet. OneTime items with a start month
  // occupy exactly one period (their own anchor).
  const now = new Date();
  const currentAbsolute = now.getFullYear() * 12 + now.getMonth();
  const entryAbs = entryDate
    ? entryDate.getFullYear() * 12 + entryDate.getMonth()
    : null;

  interface ItemWindow {
    sIdx: number;
    eIdx: number;
    startAbs: number;
    endAbs: number;
  }
  const windowByItemId = new Map<string, ItemWindow>();
  const itemStartAbsById = new Map<string, number>();
  const periodSet = new Set<number>();

  for (const item of feeItems) {
    if (item.FeeItemType === 'OneTime' && !item.feeStartMonth) continue;
    if (!item.feeStartMonth) continue;
    const sIdx = MONTH_INDEX[item.feeStartMonth as Month];
    if (sIdx === undefined) continue;

    const sAbsThisYear = now.getFullYear() * 12 + sIdx;
    const startAbs =
      sAbsThisYear <= currentAbsolute ? sAbsThisYear : sAbsThisYear - 12;
    itemStartAbsById.set(item.id, startAbs);

    let endAbs = startAbs;
    if (item.FeeItemType === 'Monthly') {
      if (!item.feeEndMonth) continue;
      const eIdx = MONTH_INDEX[item.feeEndMonth as Month];
      if (eIdx === undefined) continue;
      const span = sIdx > eIdx ? 12 - sIdx + eIdx + 1 : eIdx - sIdx + 1;
      endAbs = startAbs + span - 1;
      windowByItemId.set(item.id, { sIdx, eIdx, startAbs, endAbs });
    }

    for (let abs = startAbs; abs <= Math.min(endAbs, currentAbsolute); abs++) {
      periodSet.add(abs);
    }
  }

  const periodAbsList = [...periodSet].sort((a, b) => a - b);

  // ── Bucket existing payments into (fee_year, fee_month, feeItemId) slots ──
  // Payments are attributed by their STORED fee_month/fee_year, NOT by the
  // payment transaction date (created_at). This ensures early/late payments
  // are correctly attributed to the intended fee period.
  const paymentBySlot = new Map<
    string,
    { paid: number; discount: number; fine: number }
  >();
  for (const ci of collectionItems) {
    // Skip OneTime items (null fee_month/fee_year) — not part of monthly breakdown
    if (!ci.fee_month || ci.fee_year == null) continue;

    // Use stored fee_month/fee_year as the period for attribution
    const feeMonthIdx = MONTH_INDEX[ci.fee_month] ?? 0;
    const feeYear = ci.fee_year;

    const itemStartIdx = ci.feeItem.feeStartMonth
      ? (MONTH_INDEX[ci.feeItem.feeStartMonth] ?? 0)
      : 0;

    // Check if this period is within the fee item's applicable month range
    const itemEndIdx = ci.feeItem.feeEndMonth
      ? (MONTH_INDEX[ci.feeItem.feeEndMonth] ?? 0)
      : 0;
    // OneTime with null months was already skipped via fee_month check, skip range check for null monthly
    if (!ci.feeItem.feeStartMonth || !ci.feeItem.feeEndMonth) continue;
    if (!isMonthInFeeRange(feeMonthIdx, itemStartIdx, itemEndIdx)) {
      continue;
    }

    const slotKey = `${feeYear}-${feeMonthIdx}-${ci.feeItem.id}`;
    const agg = paymentBySlot.get(slotKey) ?? {
      paid: 0,
      discount: 0,
      fine: 0,
    };
    agg.paid += ci.paid_amount ?? 0;
    agg.discount += ci.discount_amount ?? 0;

    // Fine is calculated using the FEE PERIOD month, not the payment date.
    // calculatePeriodFine uses the period month for fine logic and the actual
    // payment date (created_at) only to determine same-period vs late payment.
    const fineEligible = isPeriodFineEligible(
      feeYear * 12 + feeMonthIdx,
      currentAbsolute,
      entryAbs,
    );
    agg.fine += calculatePeriodFine({
      paymentDate: ci.created_at ? new Date(ci.created_at) : new Date(),
      periodYear: feeYear,
      periodMonthIdx: feeMonthIdx,
      fineEligible,
      isPaymentTransaction: (ci.paid_amount ?? 0) > 0,
      isFine: ci.feeItem.isFine,
      payment_start_date: ci.feeItem.payment_start_date,
      last_payment_date: ci.feeItem.last_payment_date,
      everydayFine_amount: ci.feeItem.everydayFine_amount,
    });
    paymentBySlot.set(slotKey, agg);
  }

  // ── Build each month's breakdown ───────────────────────────────────────────
  const monthlyBreakdown = periodAbsList
    .map((abs) => {
      const year = Math.floor(abs / 12);
      const monthIdx = abs % 12;

      const isFineEligible = isPeriodFineEligible(
        abs,
        currentAbsolute,
        entryAbs,
      );

      const items = feeItems
        .filter((item) => {
          if (item.FeeItemType === 'OneTime') {
            // OneTime with no months => single payment not tied to monthly cycle, handled separately
            if (!item.feeStartMonth) return false;
            return abs === itemStartAbsById.get(item.id);
          }
          const window = windowByItemId.get(item.id);
          if (!window) return false;
          return (
            abs >= window.startAbs &&
            abs <= window.endAbs &&
            isMonthInFeeRange(monthIdx, window.sIdx, window.eIdx)
          );
        })
        .map((item): MonthlyBreakdownItem => {
          const payment = paymentBySlot.get(`${year}-${monthIdx}-${item.id}`);
          const paidAmount = payment?.paid ?? 0;
          const discountAmount = payment?.discount ?? 0;
          const fineAmount = payment?.fine ?? 0;
          const amount = item.amount;
          const dueAmount = Math.max(
            0,
            amount + fineAmount - paidAmount - discountAmount,
          );
          const status: FeePeriodStatus =
            dueAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'DUE';

          return {
            feeItemId: item.id,
            feeItemName: item.name,
            feeTypeId: feeTypeByItemId.get(item.id)?.id ?? null,
            feeTypeName: feeTypeByItemId.get(item.id)?.name ?? null,
            amount,
            paidAmount,
            discountAmount,
            fineAmount,
            dueAmount,
            status,
          };
        });

      if (items.length === 0) return null;

      const totalAmount = items.reduce((s, i) => s + i.amount, 0);
      const paidAmount = items.reduce((s, i) => s + i.paidAmount, 0);
      const discountAmount = items.reduce((s, i) => s + i.discountAmount, 0);
      const fineAmount = items.reduce((s, i) => s + i.fineAmount, 0);
      const dueAmount = items.reduce((s, i) => s + i.dueAmount, 0);

      const status: FeePeriodStatus = items.every((i) => i.status === 'PAID')
        ? 'PAID'
        : paidAmount > 0
          ? 'PARTIAL'
          : 'DUE';

      // The fee for this month is payable during THIS SAME fee month. On-time =
      // before `payment_start_date`; from `payment_start_date` the fine starts;
      // the fine is capped at `last_payment_date`. These fields keep the
      // previous response shape but now represent the fee month itself, not the
      // next month.
      const paymentDueMonthIdx = monthIdx;
      const paymentDueYear = year;

      return {
        year,
        month: MONTH_NAME_BY_INDEX[monthIdx],
        monthNumber: monthIdx + 1,
        paymentCount: items.length,
        totalAmount,
        paidAmount,
        discountAmount,
        fineAmount,
        dueAmount,
        status,
        fineEligible: isFineEligible,
        paymentDueDuringMonth: MONTH_NAME_BY_INDEX[paymentDueMonthIdx],
        paymentDueYear,
        items,
      };
    })
    .filter((m): m is MonthlyBreakdownPeriod => m !== null);

  // ── OneTime with no months (single payment) handled separately ────────
  // Supplementary attempts are enrollment-aware: same fee_item from different
  // backlog enrollments are distinct obligations (enrollment+fee_item).
  const oneTimeNullItems = feeItems.filter(
    (i) => i.FeeItemType === 'OneTime' && !i.feeStartMonth,
  );
  const oneTimeNullPayable = oneTimeNullItems.reduce((s, i) => s + i.amount, 0);
  let oneTimeNullPaid = 0;
  let oneTimeNullDiscount = 0;
  let oneTimeNullFine = 0;
  for (const it of oneTimeNullItems) {
    const src = (it as any).source_enrollment_id as string | undefined | null;
    let paidForThis = 0;
    let discountForThis = 0;
    let fineForThis = 0;
    for (const ci of collectionItems as any[]) {
      if (ci.feeItem.id !== it.id) continue;
      if (ci.fee_month != null) continue;
      if (src) {
        // Supplementary per-enrollment: exact enrollment match only
        if (ci.student_enrollment_id !== src) continue;
      } else {
        // Regular OneTime: already scoped via filterCollectionItemsByEnrollment, any matching id counts
      }
      paidForThis += ci.paid_amount ?? 0;
      discountForThis += ci.discount_amount ?? 0;
      fineForThis += ci.fine_amount ?? 0;
    }
    // Legacy NULL fallback for regular items: if no exact enrollment match and item is regular,
    // collectionItems with null student_enrollment_id (pre-refactor) should still count.
    // For supplementary, null is NOT counted per attempt to avoid double-billing; regular only.
    if (!src && paidForThis === 0) {
      for (const ci of collectionItems as any[]) {
        if (ci.feeItem.id !== it.id) continue;
        if (ci.fee_month != null) continue;
        if (ci.student_enrollment_id !== null) continue;
        paidForThis += ci.paid_amount ?? 0;
        discountForThis += ci.discount_amount ?? 0;
        fineForThis += ci.fine_amount ?? 0;
      }
    }
    oneTimeNullPaid += paidForThis;
    oneTimeNullDiscount += discountForThis;
    oneTimeNullFine += fineForThis;
  }
  const oneTimeNullDue = Math.max(
    0,
    oneTimeNullPayable +
      oneTimeNullFine -
      oneTimeNullPaid -
      oneTimeNullDiscount,
  );

  // ── Aggregate summary (monthly breakdown + OneTime null) ──────────
  const totalPayable =
    monthlyBreakdown.reduce((s, m) => s + m.totalAmount, 0) +
    oneTimeNullPayable;
  const totalPaid =
    monthlyBreakdown.reduce((s, m) => s + m.paidAmount, 0) + oneTimeNullPaid;
  const totalDiscount =
    monthlyBreakdown.reduce((s, m) => s + m.discountAmount, 0) +
    oneTimeNullDiscount;
  const totalFine =
    monthlyBreakdown.reduce((s, m) => s + m.fineAmount, 0) + oneTimeNullFine;
  const dueAmount =
    monthlyBreakdown.reduce((s, m) => s + m.dueAmount, 0) + oneTimeNullDue;

  return {
    monthlyBreakdown,
    totalPayable,
    totalPaid,
    totalDiscount,
    totalFine,
    dueAmount,
    billingStartYear:
      periodAbsList.length > 0
        ? Math.floor(periodAbsList[0] / 12)
        : now.getFullYear(),
    billingStartMonth:
      periodAbsList.length > 0 ? (periodAbsList[0] % 12) + 1 : 1,
    billingMonths: monthlyBreakdown.length,
    monthlyFeeAmount,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FEE TYPE CRUD
// ─────────────────────────────────────────────────────────────────────────────

const createFeeTypeIntoDB = async (payload: IFeeTypeCreate) => {
  const existingFeeType = await prisma.feeType.findFirst({
    where: {
      name: payload.name,
      class_id: payload.class_id,
    },
  });

  if (existingFeeType) {
    throw new Error('Fee type with this name already exists in this class');
  }

  // Verify the class exists
  const academicClass = await prisma.academicClass.findUnique({
    where: { id: payload.class_id },
  });

  if (!academicClass) {
    throw new Error('Academic class not found');
  }

  const newFeeType = await prisma.feeType.create({
    data: payload,
    include: {
      academicClass: true,
    },
  });

  return newFeeType;
};

const getAllFeeTypesFromDB = async (query: QueryParams) => {
  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name'],
  });

  // ── Cascading filters: programId / departmentId / classId → via academicClass ──
  const programId =
    typeof (query as Record<string, unknown>).programId === 'string'
      ? ((query as Record<string, unknown>).programId as string).trim()
      : undefined;
  const departmentId =
    typeof (query as Record<string, unknown>).departmentId === 'string'
      ? ((query as Record<string, unknown>).departmentId as string).trim()
      : undefined;
  const classId =
    typeof (query as Record<string, unknown>).classId === 'string'
      ? ((query as Record<string, unknown>).classId as string).trim()
      : undefined;

  // Always via department: FeeType -> AcademicClass.department_id -> Department.program_id
  const academicClassFilter: Record<string, unknown> = {};
  if (classId) {
    (academicClassFilter as Record<string, unknown>).id = classId;
  }
  if (departmentId) {
    (academicClassFilter as Record<string, unknown>).department_id =
      departmentId;
  }
  // Filter by program always via department relation (AcademicClass.department.program_id)
  // Only when program alone (no department/class) to avoid over-constraining; when both
  // program+department are provided, department_id is already scoped to that program.
  if (programId && !departmentId && !classId) {
    (academicClassFilter as Record<string, unknown>).department = {
      program_id: programId,
    };
  }

  const finalWhere =
    Object.keys(academicClassFilter).length > 0
      ? { ...where, academicClass: academicClassFilter }
      : where;

  const [totalItems, feeTypes] = await prisma.$transaction([
    prisma.feeType.count({ where: finalWhere }),
    prisma.feeType.findMany({
      skip,
      take,
      orderBy,
      where: finalWhere,
      include: {
        academicClass: {
          include: {
            department: {
              select: {
                id: true,
                department_name: true,
                program: {
                  select: {
                    id: true,
                    program_name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data: feeTypes,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FEE MANAGEMENT (per-student summary + monthly breakdown)
// ─────────────────────────────────────────────────────────────────────────────

async function feeManageFromDB(query: QueryParams): Promise<{
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: any[];
}> {
  const academicSessionId =
    typeof query.academicSessionId === 'string'
      ? query.academicSessionId.trim()
      : undefined;

  const classId =
    typeof query.class_id === 'string' ? query.class_id.trim() : undefined;
  const programId =
    typeof query.program_id === 'string' ? query.program_id.trim() : undefined;
  const departmentId =
    typeof query.department_id === 'string'
      ? query.department_id.trim()
      : undefined;

  const { skip, orderBy, take, where, page } = buildPrismaQuery(query, {
    searchFields: ['name', 'student_phone', 'id', 'email', 'nid_no'],
  });

  // Scope the list to students enrolled in the given class / program / department.
  // Class/program/department reach a Student through StudentEnrollment → AcademicClass.
  const enrollmentConditions: Prisma.StudentEnrollmentWhereInput = {};
  if (classId) enrollmentConditions.academic_class_id = classId;
  if (academicSessionId)
    enrollmentConditions.academic_session_id = academicSessionId;
  if (programId || departmentId) {
    enrollmentConditions.academicClass = {
      ...(programId ? { program_id: programId } : {}),
      ...(departmentId ? { department_id: departmentId } : {}),
    };
  }

  const whereClause = Object.keys(enrollmentConditions).length
    ? { ...where, studentEnrollments: { some: enrollmentConditions } }
    : where;

  const studentInclude = {
    studentEnrollments: {
      where: academicSessionId
        ? { academic_session_id: academicSessionId }
        : undefined,
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        created_at: true,
        academic_class_id: true,
        academic_session_id: true,
        registration_number: true,
        enrollment_type: true,
        enrollment_status: true,
        subject_fail_count: true,
        is_primary: true,
        // academicClass: { select: { id: true, class_name: true } },
        // academicSession: { select: { id: true, session_name: true } },
        batch: { select: { id: true, batch_name: true } },
        academicClass: {
          select: {
            id: true,
            class_name: true,
            department: { select: { id: true, department_name: true } },
            program: { select: { id: true, program_name: true } },
          },
        },
        academicSession: { select: { id: true, session_name: true } },
      },
    },
    studentFeeCollections: {
      select: {
        id: true,
        fee_type_id: true,
        student_id: true,
        feeType: {
          select: { id: true, name: true },
        },
        studentFeeCollectionItems: {
          select: {
            id: true,
            student_enrollment_id: true,
            created_at: true,
            paid_amount: true,
            discount_amount: true,
            line_total_amount: true,
            fine_amount: true,
            fee_month: true,
            fee_year: true,
            feeItem: {
              select: {
                id: true,
                name: true,
                amount: true,
                amount_every_subject: true,
                fee_assign_for: true,
                FeeItemType: true,
                isFine: true,
                feeStartMonth: true,
                feeEndMonth: true,
                payment_start_date: true,
                last_payment_date: true,
                everydayFine_amount: true,
              },
            },
            collectionInfos: {
              select: {
                id: true,
                paid_amount: true,
                payment_method: true,
                payment_note: true,
                collectedBy: true,
                created_at: true,
              },
              orderBy: { created_at: 'asc' },
            },
          },
        },
      },
    },
  } satisfies Prisma.StudentInclude;

  type FeeManageStudent = Prisma.StudentGetPayload<{
    include: typeof studentInclude;
  }>;

  const [totalItems, students] = (await prisma.$transaction([
    prisma.student.count({ where: whereClause }),
    prisma.student.findMany({
      skip,
      take,
      orderBy,
      where: whereClause,
      omit: { password: true },
      include: studentInclude,
    }),
  ])) as [number, FeeManageStudent[]];

  // 1. Pull the current class_id per student from their PRIMARY enrollment
  const classIds = [
    ...new Set(
      students
        .flatMap((student) => {
          const primaryEnrollment = student.studentEnrollments.find(
            (e) => e.is_primary,
          );
          const failedEnrollments = student.studentEnrollments.filter(
            (e) =>
              e.enrollment_status === EnrollmentStatus.WITH_BACKLOG &&
              e.enrollment_type === EnrollmentType.SUPPLEMENTARY,
          );
          const classIds = [primaryEnrollment?.academic_class_id];
          for (const failed of failedEnrollments) {
            if (failed.academic_class_id) {
              classIds.push(failed.academic_class_id);
            }
          }
          return classIds.filter((id): id is string => Boolean(id));
        })
        .filter((id: string | undefined): id is string => Boolean(id)),
    ),
  ];

  // 2. Fetch the fee structure (FeeType -> FeeItem) for those classes in one query
  // Include fee_assign_for and amount_every_subject for supplementary support
  let feeStructures: Prisma.FeeTypeGetPayload<{
    include: {
      academicClass: {
        select: {
          class_name: true;
        };
      };
      feeItems: {
        select: {
          id: true;
          name: true;
          amount: true;
          amount_every_subject: true;
          fee_assign_for: true;
          FeeItemType: true;
          isFine: true;
          feeStartMonth: true;
          feeEndMonth: true;
        };
      };
    };
  }>[] = [];
  if (classIds.length) {
    feeStructures = await prisma.feeType.findMany({
      where: { class_id: { in: classIds as string[] } },
      include: {
        academicClass: {
          select: {
            class_name: true,
          },
        },
        feeItems: {
          select: {
            id: true,
            name: true,
            amount: true,
            amount_every_subject: true,
            fee_assign_for: true,
            FeeItemType: true,
            isFine: true,
            feeStartMonth: true,
            feeEndMonth: true,
          },
        },
      },
    });
  }

  // 3. Group fee structures by class_id for O(1) lookup
  const feeStructureByClass = feeStructures.reduce<
    Record<string, typeof feeStructures>
  >((acc, ft) => {
    (acc[ft.class_id] ??= []).push(ft);
    return acc;
  }, {});

  // 4. Build the per-student summary
  // Entry date: primary enrollment created_at (StudentPromotion table removed in new system)
  const data = await Promise.all(
    students.map(async (student) => {
      // Find primary enrollment
      const enrollment = student.studentEnrollments.find((e) => e.is_primary);
      const currentClassId = enrollment?.academic_class_id;

      // Find ALL failed year's enrollments (where student actually failed)
      // Each WITH_BACKLOG + SUPPLEMENTARY enrollment represents a failed year with its own supplementary fees
      const failedEnrollments = student.studentEnrollments.filter(
        (e) =>
          e.enrollment_status === EnrollmentStatus.WITH_BACKLOG &&
          e.enrollment_type === EnrollmentType.SUPPLEMENTARY,
      );

      // Entry into the CURRENT class (fine-grace anchor): primary enrollment created_at
      const entryDate = enrollment?.created_at ?? student.created_at;

      // Get regular fee items for current class
      const regularFeeTypes = currentClassId
        ? (feeStructureByClass[currentClassId] ?? [])
        : [];

      // Filter regular fee items (REGULAR fees for current class)
      const regularFeeItems = regularFeeTypes.flatMap((ft) =>
        ft.feeItems.filter(
          (fi) => fi.fee_assign_for === Fee_Assign_FOR.REGULAR,
        ),
      );

      // Get supplementary fee items from EACH failed year's class for SUPPLEMENTARY backlog
      const supplementaryItems: MonthlyBreakdownFeeItem[] = [];
      if (failedEnrollments.length > 0) {
        // Fetch academic class names for all failed enrollments
        const supplementaryClassIds = failedEnrollments
          .map((e) => e.academic_class_id)
          .filter(Boolean);
        let supplementaryClasses: { id: string; class_name: string }[] = [];
        if (supplementaryClassIds.length > 0) {
          const foundClasses = await prisma.academicClass.findMany({
            where: { id: { in: supplementaryClassIds } },
            select: { id: true, class_name: true },
          });
          supplementaryClasses = foundClasses;
        } else {
          supplementaryClasses = [];
        }
        const classNameMap = new Map(
          supplementaryClasses.map((c) => [c.id, c.class_name]),
        );

        for (const failedEnrollment of failedEnrollments) {
          const supplementaryClassId = failedEnrollment.academic_class_id;
          const subjectFailCount = failedEnrollment.subject_fail_count ?? 0;
          const supplementaryClassName = supplementaryClassId
            ? (classNameMap.get(supplementaryClassId) ?? 'N/A')
            : 'N/A';
          const prevFeeTypes = feeStructureByClass[supplementaryClassId] ?? [];
          const itemsForThisYear = prevFeeTypes.flatMap((ft) =>
            ft.feeItems
              .filter(
                (fi) => fi.fee_assign_for === Fee_Assign_FOR.SUPPLEMENTARY,
              )
              .map((fi) => ({
                id: fi.id,
                name: fi.name,
                amount: 0, // Will be calculated in buildMonthlyBreakdown
                amount_every_subject: fi.amount_every_subject ?? 0,
                subject_fail_count: subjectFailCount, // Store fail count per item
                fee_assign_for: Fee_Assign_FOR.SUPPLEMENTARY,
                FeeItemType: 'OneTime' as FeeItemType,
                isFine: fi.isFine,
                feeStartMonth: null,
                feeEndMonth: null,
                supplementary_class_name: supplementaryClassName, // Store class name
                fee_type_id: ft.id, // Include the FeeType's ID for supplementary fees
                source_enrollment_id: failedEnrollment.id,
              })),
          );
          supplementaryItems.push(...itemsForThisYear);
        }
      }

      // Combine regular fee types with supplementary items
      const applicableFeeTypes = regularFeeTypes.map((ft) => ({
        ...ft,
        feeItems: ft.feeItems.filter(
          (fi) => fi.fee_assign_for === Fee_Assign_FOR.REGULAR,
        ),
      }));

      // One-time fees expected from the class fee structure but not yet billed
      // Enrollment-scoped: supplementary dedup is enrollment+fee_item, regular is fee_item (primary+NULL)
      const primaryEnrollmentId = enrollment?.id ?? null;
      const failedEnrollmentIds = failedEnrollments.map((e) => e.id);
      const scopedCollectionItems = filterCollectionItemsByEnrollment(
        student.studentFeeCollections.flatMap(
          (collection) => collection.studentFeeCollectionItems,
        ),
        primaryEnrollmentId,
        failedEnrollmentIds,
      );
      // Composite billed set: enrollmentId:feeItemId to allow repeated supplementary attempts with same fee_item
      const billedCompositeIds = new Set(
        scopedCollectionItems
          .map((item) => {
            const fid = item.feeItem?.id;
            if (!fid) return null;
            const enrollKey = (item as any).student_enrollment_id ?? 'NULL';
            return `${enrollKey}:${fid}`;
          })
          .filter((k): k is string => Boolean(k)),
      );
      const billedFeeItemIds = new Set(
        scopedCollectionItems
          .map((item) => item.feeItem?.id)
          .filter((id): id is string => Boolean(id)),
      );

      // Unbilled regular OneTime fees (regular dedup stays by fee_item only to preserve legacy NULL fallback)
      const unbilledRegularOneTimeFees = regularFeeItems
        .filter(
          (fi) =>
            fi.FeeItemType === 'OneTime' &&
            !fi.feeStartMonth &&
            !billedFeeItemIds.has(fi.id),
        )
        .map((fi) => {
          const feeType = regularFeeTypes.find((ft) =>
            ft.feeItems.some((f) => f.id === fi.id),
          );
          return {
            id: fi.id,
            name: fi.name,
            amount: fi.amount,
            fee_type_id: feeType?.id ?? '',
            fee_type_name: feeType?.name ?? '',
            academic_class: {
              class_name: feeType?.academicClass?.class_name ?? 'N/A',
            },
          };
        });

      // Unbilled supplementary fees - enrollment-aware composite key
      const unbilledSupplementaryFees = supplementaryItems
        .filter((fi) => {
          const composite = `${(fi as any).source_enrollment_id ?? 'NULL'}:${fi.id}`;
          if (billedCompositeIds.has(composite)) return false;
          // Legacy NULL fallback: if a legacy null row exists for this feeItem, consider oldest attempt billed
          // But don't block other attempts - only if null exists and this is the oldest enrollment for that feeItem
          if (billedCompositeIds.has(`NULL:${fi.id}`)) {
            // If null exists, treat only the first supplementary item with that id as billed, subsequent remain unbilled
            const firstIdx = supplementaryItems.findIndex(
              (s) => s.id === fi.id,
            );
            return supplementaryItems.indexOf(fi) !== firstIdx;
          }
          return true;
        })
        .map((fi) => ({
          id: fi.id,
          name: fi.name,
          amount: (fi.amount_every_subject ?? 0) * (fi.subject_fail_count ?? 0),
          fee_type_id: fi.fee_type_id ?? 'supplementary',
          fee_type_name: 'Supplementary Exam Fees',
          academic_class: {
            class_name: fi.supplementary_class_name ?? 'N/A',
          },
          source_enrollment_id: (fi as any).source_enrollment_id,
        }));

      const unbilledOneTimeFees = [
        ...unbilledRegularOneTimeFees,
        ...unbilledSupplementaryFees,
      ];

      const breakdown = buildMonthlyBreakdown({
        entryDate,
        applicableFeeTypes,
        collectionItems: scopedCollectionItems,
        supplementaryItems,
      });

      const {
        monthlyBreakdown,
        totalPayable,
        totalPaid,
        totalDiscount,
        totalFine,
        dueAmount,
        billingStartYear,
        billingStartMonth,
        billingMonths,
        monthlyFeeAmount,
      } = breakdown;

      // totalBilled keeps the original meaning: actual billed amount + fines.
      // Since monthly amounts are derived from the fee structure, totalLineAmount
      // equals totalPayable, so totalBilled = totalPayable + totalFine.
      const totalBilled = totalPayable + totalFine;

      return {
        ...student,
        registration_number: enrollment?.registration_number ?? null,
        unbilledOneTimeFees,
        feeSummary: {
          classId: currentClassId ?? null,
          sessionId: enrollment?.academic_session_id ?? null,
          sessionName: enrollment?.academicSession?.session_name ?? null,
          billingStartYear,
          billingStartMonth,
          billingMonths,
          monthlyFeeAmount,
          totalPayable,
          totalBilled,
          totalPaid,
          totalDiscount,
          totalLineAmount: totalPayable,
          totalFine,
          dueAmount,
          monthlyBreakdown,
        },
      };
    }),
  );

  return {
    meta: calculatePaginationMeta(totalItems, page, take),
    data,
  };
}

const getFeeTypeByIdFromDB = async (feeTypeId: string) => {
  const existingFeeType = await prisma.feeType.findUnique({
    where: {
      id: feeTypeId,
    },
    include: {
      academicClass: true,
    },
  });

  if (!existingFeeType) {
    throw new Error('Fee type not found');
  }

  return existingFeeType;
};

const updateFeeTypeFromDB = async (
  feeTypeId: string,
  payload: IFeeTypeUpdate,
) => {
  const existingFeeType = await prisma.feeType.findUnique({
    where: {
      id: feeTypeId,
    },
  });

  if (!existingFeeType) {
    throw new Error('Fee type not found');
  }

  // If updating name or class_id, check for duplicate
  if (payload.name || payload.class_id) {
    const duplicate = await prisma.feeType.findFirst({
      where: {
        name: payload.name ?? existingFeeType.name,
        class_id: payload.class_id ?? existingFeeType.class_id,
        NOT: { id: feeTypeId },
      },
    });

    if (duplicate) {
      throw new Error('Fee type with this name already exists in this class');
    }
  }

  // If class_id is being updated, verify the class exists
  if (payload.class_id) {
    const academicClass = await prisma.academicClass.findUnique({
      where: { id: payload.class_id },
    });

    if (!academicClass) {
      throw new Error('Academic class not found');
    }
  }

  const updatedFeeType = await prisma.feeType.update({
    where: {
      id: feeTypeId,
    },
    data: payload,
    include: {
      academicClass: true,
    },
  });

  return updatedFeeType;
};

const deleteFeeTypeFromDB = async (feeTypeId: string) => {
  const existingFeeType = await prisma.feeType.findUnique({
    where: {
      id: feeTypeId,
    },
  });

  if (!existingFeeType) {
    throw new Error('Fee type not found');
  }

  await prisma.feeType.delete({
    where: {
      id: feeTypeId,
    },
  });
};

export const FeeTypeService = {
  createFeeTypeIntoDB,
  getAllFeeTypesFromDB,
  getFeeTypeByIdFromDB,
  updateFeeTypeFromDB,
  deleteFeeTypeFromDB,
  feeManageFromDB,
};
