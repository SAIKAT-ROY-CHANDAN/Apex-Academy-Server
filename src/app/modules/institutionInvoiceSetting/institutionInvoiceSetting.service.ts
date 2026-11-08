import prisma from '../../../db/db.config';
import {
  IInstitutionInvoiceSettingCreate,
  IInstitutionInvoiceSettingUpdate,
} from './institutionInvoiceSetting.type';

const createInstitutionInvoiceSettingIntoDB = async (
  payload: IInstitutionInvoiceSettingCreate,
) => {
  const result = await prisma.institutionInvoiceSetting.create({
    data: payload,
  });

  return result;
};

const getAllInstitutionInvoiceSettingsFromDB = async () => {
  const institutionInvoiceSetting =
    await prisma.institutionInvoiceSetting.findFirst({
      orderBy: { createdAt: 'asc' },
    });

  return institutionInvoiceSetting;
};

const getInstitutionInvoiceSettingByIdFromDB = async (id: string) => {
  const result = await prisma.institutionInvoiceSetting.findUniqueOrThrow({
    where: { id },
  });

  return result;
};

const updateInstitutionInvoiceSettingFromDB = async (
  id: string,
  payload: IInstitutionInvoiceSettingUpdate,
) => {
  const existing = await prisma.institutionInvoiceSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Institution invoice setting not found');
  }

  const result = await prisma.institutionInvoiceSetting.update({
    where: { id },
    data: payload,
  });

  return result;
};

const deleteInstitutionInvoiceSettingFromDB = async (id: string) => {
  const existing = await prisma.institutionInvoiceSetting.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Institution invoice setting not found');
  }

  await prisma.institutionInvoiceSetting.delete({
    where: { id },
  });
};

export const InstitutionInvoiceSettingService = {
  createInstitutionInvoiceSettingIntoDB,
  getAllInstitutionInvoiceSettingsFromDB,
  getInstitutionInvoiceSettingByIdFromDB,
  updateInstitutionInvoiceSettingFromDB,
  deleteInstitutionInvoiceSettingFromDB,
};
