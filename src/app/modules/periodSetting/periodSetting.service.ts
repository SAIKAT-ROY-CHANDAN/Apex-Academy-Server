import prisma from '../../../db/db.config';
import { DEFAULT_PERIOD_COUNT } from '../../constant/periods';
import AppError from '../../errors/AppError';
import { IPeriodTime, IPeriodSettingCreate, IPeriodSettingUpdate } from './periodSetting.type';

const getOrCreatePeriodSetting = async () => {
  let setting = await prisma.periodSetting.findFirst({
    orderBy: { created_at: 'asc' },
  });

  if (!setting) {
    setting = await prisma.periodSetting.create({
      data: {
        period_count: DEFAULT_PERIOD_COUNT,
      },
    });
  }

  return setting;
};

/**
 * The periods list is the source of truth for how many periods exist, so the
 * stored period_count is always derived from it. That keeps the two from
 * drifting apart when rows are added or removed in the dialog.
 */
const resolvePeriodCount = (
  requested: number | undefined,
  periods: IPeriodTime[] | undefined,
): number | undefined => {
  if (periods && periods.length > 0) return periods.length;
  return requested;
};

/**
 * Reducing the period count while routines still use the higher periods would
 * silently drop that data from the grid, so it is rejected with the exact
 * range that is still in use.
 */
const assertPeriodCountReducible = async (nextPeriodCount: number) => {
  const used = await prisma.classRoutineItem.findMany({
    where: { period_no: { gt: nextPeriodCount } },
    select: { period_no: true },
    distinct: ['period_no'],
  });

  if (used.length === 0) return;

  const numbers = used.map((item) => item.period_no).sort((a, b) => a - b);
  const first = numbers[0];
  const last = numbers[numbers.length - 1];
  const range = first === last ? `${first}` : `${first}-${last}`;

  throw new AppError(
    400,
    `Periods ${range} are used by existing routines. Remove those routine entries before reducing the number of periods to ${nextPeriodCount}.`,
  );
};

const getPeriodSettingFromDB = async () => {
  return getOrCreatePeriodSetting();
};

const createPeriodSettingIntoDB = async (payload: IPeriodSettingCreate) => {
  const existing = await getOrCreatePeriodSetting();

  const periodCount =
    resolvePeriodCount(payload.period_count, payload.periods) ??
    existing.period_count;

  if (periodCount < existing.period_count) {
    await assertPeriodCountReducible(periodCount);
  }

  return prisma.periodSetting.update({
    where: { id: existing.id },
    data: {
      period_count: periodCount,
      ...(payload.periods !== undefined && {
        periods: JSON.parse(JSON.stringify(payload.periods)),
      }),
    },
  });
};

const updatePeriodSettingInDB = async (payload: IPeriodSettingUpdate) => {
  const existing = await getOrCreatePeriodSetting();

  const periodCount = resolvePeriodCount(
    payload.period_count,
    payload.periods,
  );

  if (periodCount !== undefined && periodCount < existing.period_count) {
    await assertPeriodCountReducible(periodCount);
  }

  return prisma.periodSetting.update({
    where: { id: existing.id },
    data: {
      ...(periodCount !== undefined && { period_count: periodCount }),
      ...(payload.periods !== undefined && {
        periods: JSON.parse(JSON.stringify(payload.periods)),
      }),
    },
  });
};

export const periodSettingService = {
  getPeriodSettingFromDB,
  createPeriodSettingIntoDB,
  updatePeriodSettingInDB,
};