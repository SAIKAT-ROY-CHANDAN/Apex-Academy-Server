/**
 * Sanity cap on the number of class periods per day.
 *
 * This is the single source of truth on the server: raise it here (and keep
 * the client-side MAX_PERIODS in
 * `eims-client/src/app/(dashboard)/dashboard/academics/class-routine/_components/period-settings.ts`
 * in sync) if an institute ever needs more periods.
 *
 * It is deliberately not a product limit - the real count is whatever the admin
 * adds in Period Settings. This only protects the API and the UI from an
 * unreasonable value.
 */
export const MAX_PERIODS = 20;

/** Number of periods used before an admin configures the period settings. */
export const DEFAULT_PERIOD_COUNT = 6;