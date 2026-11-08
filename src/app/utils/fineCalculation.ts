export interface IFineCalculationInput {
  isFine: boolean;
  payment_start_date?: number | null;
  last_payment_date?: number | null;
  everydayFine_amount?: number | null;
  paymentDate?: Date;
  /** If true, the caller is indicating an actual payment transaction is
   *  occurring. If false (default), no fine will be calculated because the
   *  fee is merely being assigned/created without a payment. */
  isPaymentTransaction?: boolean;
}

/**
 * Calculates the fine amount for a fine-enabled fee item.
 *
 * Every `FeeItem` carries its OWN dynamic fine configuration:
 *   payment_start_date  – day of month the fine window begins (inclusive)
 *   last_payment_date   – day of month when the fine window is capped (inclusive)
 *   everydayFine_amount – daily fine rate
 *
 * These values are NEVER hardcoded. They always come from the specific
 * `FeeItem` fields and therefore adapt automatically to each fee item
 * (e.g. 5/10/50, 1/7/100, 10/15/25, …).
 *
 * Business rules:
 * 1. Fine is ONLY calculated when `isPaymentTransaction === true`.
 *    Creating a fee record with `paid_amount = 0` (no actual payment) never
 *    generates a fine, regardless of the calendar date.
 * 2. If `isFine === false` → fine = 0.
 * 3. Configuration validation (invalid → 0, never a negative/incorrect fine):
 *      payment_start_date  > 0
 *      last_payment_date   > 0
 *      everydayFine_amount >= 0
 *      payment_start_date  <= last_payment_date
 * 4. The payment day is taken from the actual payment/transaction date
 *    (`paymentDate`, defaults to today). The month/year of that date provide
 *    the context for "this month's" fine window automatically.
 * 5. Formula (integer day-of-month based):
 *      if paymentDay < payment_start_date → fineDays = 0
 *      else → effectivePaymentDay = min(paymentDay, last_payment_date)
 *             fineDays = effectivePaymentDay − payment_start_date + 1
 *      fineAmount = fineDays × everydayFine_amount
 *    This means:
 *      payment on  start_date          → 1 fine day
 *      payment on  last_payment_date   → max fine days (capped)
 *      payment after last_payment_date → capped at the same max fine days
 *
 * Examples (start=5, last=10, daily=50):
 *   Aug 5  → 1 × 50 =  50
 *   Aug 8  → 4 × 50 = 200
 *   Aug 10 → 6 × 50 = 300  (max)
 *   Aug 12 → 6 × 50 = 300  (capped)
 *
 * If the same item is paid in September, the same configuration applies to
 * September's days automatically (Sep 5 → 1, Sep 8 → 4, Sep 10 → 6, …).
 */
export const calculateFineAmount = ({
  isFine,
  payment_start_date,
  last_payment_date,
  everydayFine_amount,
  paymentDate = new Date(),
  isPaymentTransaction = false,
}: IFineCalculationInput): number => {
  // Rule 1: Only calculate fine for actual payment transactions
  if (!isPaymentTransaction) {
    return 0;
  }

  // Rule 2: Not a fine item
  if (!isFine) {
    return 0;
  }

  // Rule 3: Configuration validation
  if (
    payment_start_date == null ||
    last_payment_date == null ||
    everydayFine_amount == null ||
    payment_start_date <= 0 ||
    last_payment_date <= 0 ||
    everydayFine_amount < 0 ||
    payment_start_date > last_payment_date
  ) {
    return 0;
  }

  // Rule 4: Day of month from the actual payment date
  const paymentDay = paymentDate.getDate();

  // Rule 5: Formula
  if (paymentDay < payment_start_date) {
    return 0;
  }

  const effectivePaymentDay = Math.min(paymentDay, last_payment_date);
  const fineDays = effectivePaymentDay - payment_start_date + 1;

  return fineDays * everydayFine_amount;
};

export const MONTH_INDEX_MAP: Record<string, number> = {
  JANUARY: 0, FEBRUARY: 1, MARCH: 2, APRIL: 3, MAY: 4, JUNE: 5,
  JULY: 6, AUGUST: 7, SEPTEMBER: 8, OCTOBER: 9, NOVEMBER: 10, DECEMBER: 11,
};

/**
 * Determines which billing cycle year a payment month belongs to.
 *
 * Requires admissionMonthIdx to correctly compute the cycle's start year.
 *
 * Example: JULY→JUNE cycle, admitted September 2026
 *   cycleStartYear = 2026 (Sep >= Jul → same year)
 *   January 2027 payment → paymentMonth(0) < startMonth(6)
 *     → cycleStartYear - 1? No — correct logic:
 *     → cycleStartYear=2026, but Jan is in the NEXT cycle → 2027
 *
 * General algorithm:
 *   1. cycleStartYear = admissionMonthIdx >= cycleStartMonthIdx
 *        ? admissionYear : admissionYear - 1
 *   2. If paymentMonthIdx >= cycleStartMonthIdx → cycleStartYear
 *      Else → cycleStartYear + 1 (next cycle, year increased)
 */
export const determineCycleYear = (
  paymentMonthIdx: number,
  cycleStartMonthIdx: number,
  admissionYear: number,
  admissionMonthIdx: number,
): number => {
  const cycleStartYear =
    admissionMonthIdx >= cycleStartMonthIdx
      ? admissionYear
      : admissionYear - 1;

  if (paymentMonthIdx >= cycleStartMonthIdx) {
    return cycleStartYear;
  }

  // Payment month is before the cycle start month → next cycle → year + 1
  return cycleStartYear + 1;
};

/**
 * Computes the fine for a single payment allocated to a specific FEE PERIOD.
 *
 * The fine is ALWAYS calculated using the fee period's month, never the
 * payment date's month. A January fee paid in February still uses January's
 * calendar for fine calculation.
 *
 *  - Payment inside the fee month        → fine by actual payment day
 *  - Payment in a later month (late)     → fine capped at last_payment_date
 *  - Period before admission month       → not fine-eligible → 0
 */
export const calculatePeriodFine = ({
  paymentDate,
  periodYear,
  periodMonthIdx,
  fineEligible,
  isPaymentTransaction,
  ...fineConfig
}: {
  paymentDate: Date;
  periodYear: number;
  periodMonthIdx: number;
  fineEligible: boolean;
  isPaymentTransaction: boolean;
  isFine: boolean;
  payment_start_date: number | null;
  last_payment_date: number | null;
  everydayFine_amount: number | null;
}): number => {
  if (!fineEligible) return 0;
  if (!isPaymentTransaction) return 0;

  const paymentYear = paymentDate.getFullYear();
  const paymentMonthIdx = paymentDate.getMonth();

  const isSamePeriod =
    paymentYear === periodYear && paymentMonthIdx === periodMonthIdx;

  if (isSamePeriod) {
    return calculateFineAmount({
      ...fineConfig,
      paymentDate,
      isPaymentTransaction: true,
    });
  }

  const daysInPeriodMonth = new Date(
    periodYear,
    periodMonthIdx + 1,
    0,
  ).getDate();
  const capDay = Math.min(
    fineConfig.last_payment_date ?? 1,
    daysInPeriodMonth,
  );
  return calculateFineAmount({
    ...fineConfig,
    paymentDate: new Date(periodYear, periodMonthIdx, capDay),
    isPaymentTransaction: true,
  });
};