import prisma from '../../../db/db.config';
import { TDepositPayload, TDepositUpdatePayload } from './deposit.type';

const parseDate = (raw: string | undefined): Date => {
  if (!raw || !raw.trim()) return new Date();
  const trimmed = raw.trim();
  const ddmm = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmm) {
    const [, dd, mm, yyyy] = ddmm;
    const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
    const local = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!isNaN(local.getTime())) return local;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return d;
  return new Date();
};

const createDepositIntoDB = async (payload: TDepositPayload) => {
  const result = await prisma.$transaction(async (tx) => {
    // Verify deposit type exists
    const depositType = await tx.depositType.findUnique({
      where: { id: payload.deposit_type_id },
    });


    if (!depositType) {
      throw new Error('Deposit type not found');
    }

    const deposit = await tx.deposit.create({
      data: {
        deposit_type_id: payload.deposit_type_id,
        deposit_date: parseDate(payload.deposit_date),
        total_amount: payload.total_amount,
        description: payload.description,
        depositItems: {
          createMany: {
            data: payload.depositItems.map((item) => ({
              item_name: item.item_name,
              item_amount: item.item_amount,
              description: item.description,
            })),
          },
        },
      },
      include: {
        depositType: true,
        depositItems: true,
      },
    });

    return deposit;
  });

  return result;
};

const getAllDepositsFromDB = async () => {
  const deposits = await prisma.deposit.findMany({
    include: {
      depositType: true,
      depositItems: true,
    },
    orderBy: {
      deposit_date: 'desc',
    },
  });

  return deposits;
};

const getDepositByIdFromDB = async (id: string) => {
  const deposit = await prisma.deposit.findUnique({
    where: { id },
    include: {
      depositType: true,
      depositItems: true,
    },
  });

  if (!deposit) {
    throw new Error('Deposit not found');
  }

  return deposit;
};

const updateDepositInDB = async (id: string, payload: TDepositUpdatePayload) => {
  const result = await prisma.$transaction(async (tx) => {
    const existingDeposit = await tx.deposit.findUnique({
      where: { id },
    });

    if (!existingDeposit) {
      throw new Error('Deposit not found');
    }

    if (payload.deposit_type_id) {
      const depositType = await tx.depositType.findUnique({
        where: { id: payload.deposit_type_id },
      });

      if (!depositType) {
        throw new Error('Deposit type not found');
      }
    }

    if (payload.depositItems) {
      await tx.depositItem.deleteMany({
        where: { deposit_id: id },
      });

      await tx.depositItem.createMany({
        data: payload.depositItems.map((item) => ({
          deposit_id: id,
          item_name: item.item_name,
          item_amount: item.item_amount,
          description: item.description,
        })),
      });
    }

    const updatedDeposit = await tx.deposit.update({
      where: { id },
      data: {
        deposit_type_id: payload.deposit_type_id,
        deposit_date: payload.deposit_date ? parseDate(payload.deposit_date) : undefined,
        total_amount: payload.total_amount,
        description: payload.description,
      },
      include: {
        depositType: true,
        depositItems: true,
      },
    });

    return updatedDeposit;
  });

  return result;
};

const deleteDepositFromDB = async (id: string) => {
  const existingDeposit = await prisma.deposit.findUnique({
    where: { id },
  });

  if (!existingDeposit) {
    throw new Error('Deposit not found');
  }

  await prisma.deposit.delete({
    where: { id },
  });

  return existingDeposit;
};

export const depositService = {
  createDepositIntoDB,
  getAllDepositsFromDB,
  getDepositByIdFromDB,
  updateDepositInDB,
  deleteDepositFromDB,
};