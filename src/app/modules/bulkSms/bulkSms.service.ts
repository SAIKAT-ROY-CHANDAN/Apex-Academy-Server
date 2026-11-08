import config from '../../configs';
import AppError from '../../errors/AppError';
import prisma from '../../../db/db.config';
import { ISendBulkSms } from './bulkSms.type';

type StudentPhone = {
  student_phone: string | null;
  father_phone: string;
};

const getStudentPhoneNumbers = (students: StudentPhone[]) => [
  ...new Set(
    students
      .map((student) => student.student_phone ?? student.father_phone)
      .map((phone) => phone.trim())
      .filter(Boolean),
  ),
];

const getPhoneNumbersForTarget = async (payload: ISendBulkSms) => {
  if (payload.target === 'MANUAL') {
    return [
      ...new Set((payload.phoneNumbers ?? []).map((phone) => phone.trim())),
    ];
  }

  if (payload.target === 'ALL_STUDENTS') {
    const students = await prisma.student.findMany({
      where: { is_active: true },
      select: { student_phone: true, father_phone: true },
    });

    return getStudentPhoneNumbers(students);
  }

  if (payload.target === 'STUDENT') {
    const student = await prisma.student.findUnique({
      where: { id: payload.targetId },
      select: { is_active: true, student_phone: true, father_phone: true },
    });

    if (!student || !student.is_active) {
      throw new AppError(404, 'Active student not found');
    }

    return getStudentPhoneNumbers([student]);
  }

  const enrollmentWhere =
    payload.target === 'BATCH'
      ? { batch_id: payload.targetId }
      : payload.target === 'CLASS'
        ? { academic_class_id: payload.targetId }
        : { shift_id: payload.targetId };

  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      ...enrollmentWhere,
      ...(payload.target === 'CLASS' ? { is_primary: true } : {}),
      ...(payload.target === 'CLASS' && payload.batchId
        ? { batch_id: payload.batchId }
        : {}),
      student: { is_active: true },
    },
    select: {
      student: {
        select: { student_phone: true, father_phone: true },
      },
    },
  });

  return getStudentPhoneNumbers(
    enrollments.map((enrollment) => enrollment.student),
  );
};

const parseProviderResponse = (body: string) => {
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
};

const sendBulkSms = async (payload: ISendBulkSms) => {
  console.log('[BulkSMS] Sending SMS:', {
    target: payload.target,
    phoneNumbers: payload.phoneNumbers,
    messageLength: payload.message.length,
  });

  const phoneNumbers = await getPhoneNumbersForTarget(payload);

  console.log('[BulkSMS] Resolved phone numbers:', phoneNumbers);

  if (!phoneNumbers.length) {
    console.log('[BulkSMS] No phone numbers found');
    throw new AppError(
      404,
      'No active student phone numbers found for this target',
    );
  }

  const { apiKey, senderId, baseUrl } = config.bulkSms;
  console.log('[BulkSMS] Config:', {
    hasApiKey: !!apiKey,
    hasSenderId: !!senderId,
    baseUrl,
  });

  if (!apiKey || !senderId) {
    console.log('[BulkSMS] Missing config');
    throw new AppError(500, 'Bulk SMS provider is not configured');
  }

  const url = new URL(baseUrl);
  url.search = new URLSearchParams({
    api_key: apiKey,
    type: 'text',
    number: phoneNumbers.join(','),
    senderid: senderId,
    message: payload.message,
  }).toString();

  console.log('[BulkSMS] Calling provider:', url);

  let providerResponse: Response;
  try {
    providerResponse = await fetch(url, { method: 'GET' });
  } catch (e) {
    console.error('[BulkSMS] Fetch error:', e);
    throw new AppError(502, 'Unable to reach the Bulk SMS provider');
  }

  console.log('[BulkSMS] Provider response status:', providerResponse.status);

  const providerData = parseProviderResponse(await providerResponse.text());
  if (!providerResponse.ok) {
    console.error('[BulkSMS] Provider error:', providerData);
    throw new AppError(502, 'Bulk SMS provider rejected the request');
  }

  console.log('[BulkSMS] Success:', providerData);

  return {
    recipientCount: phoneNumbers.length,
    providerData,
  };
};

export const BulkSmsService = {
  sendBulkSms,
};

export { sendBulkSms };
