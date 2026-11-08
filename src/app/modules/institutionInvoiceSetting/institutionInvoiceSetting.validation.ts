import z from 'zod';

const createInstitutionInvoiceSettingValidation = z.object({
  body: z.object({
    watermarkUrl: z.string().optional(),
    headerUrl: z.string().optional(),
    footerUrl: z.string().optional(),
  }),
});

const updateInstitutionInvoiceSettingValidation = z.object({
  body: z.object({
    watermarkUrl: z.string().optional(),
    headerUrl: z.string().optional(),
    footerUrl: z.string().optional(),
  }),
});

export const InstitutionInvoiceSettingValidation = {
  createInstitutionInvoiceSettingValidation,
  updateInstitutionInvoiceSettingValidation,
};
