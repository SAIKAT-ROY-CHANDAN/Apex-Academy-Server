import axios from 'axios';
import configs from '../../configs';

interface BkashTokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: number;
}

interface BkashCreateResponse {
  paymentID: string;
  bkashURL: string;
  statusCode?: string;
  statusMessage?: string;
  transactionStatus?: string;
  status?: string;
}

interface BkashExecuteResponse {
  paymentID: string;
  trxID?: string;
  transactionId?: string;
  customerMsisdn?: string;
  senderNumber?: string;
  amount: string;
  transactionStatus?: string;
  statusCode?: string;
  statusMessage?: string;
  status?: string;
}

export interface BkashQueryStatusResponse {
  paymentID: string;
  trxID?: string;
  transactionStatus?: string;
  amount?: string;
  currency?: string;
  intent?: string;
  merchantInvoiceNumber?: string;
  statusCode?: string;
  statusMessage?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;
let pendingTokenPromise: Promise<string> | null = null;

/**
 * Strips sensitive authorization headers and credentials from error objects
 * to prevent leaking basic auth credentials in server logs.
 */
const sanitizeBkashError = (error: unknown, fallbackMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { statusMessage?: string; message?: string } | undefined;
    const msg = data?.statusMessage || data?.message || error.message || fallbackMessage;
    return new Error(`bKash Gateway Error: ${msg}`);
  }
  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const getBkashToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = (async () => {
    try {
      const { data } = await axios.post<BkashTokenResponse>(
        `${configs.bkash.baseUrl}/tokenized/checkout/token/grant`,
        {
          app_key: configs.bkash.appKey,
          app_secret: configs.bkash.appSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            username: configs.bkash.username,
            password: configs.bkash.password,
          },
        },
      );

      cachedToken = {
        token: data.id_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000,
      };

      return data.id_token;
    } catch (err) {
      cachedToken = null;
      throw sanitizeBkashError(err, 'Failed to obtain bKash access token');
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
};

export const createBkashPayment = async (params: {
  amount: number;
  merchantInvoiceNumber: string;
  callbackURL: string;
  payerReference: string;
}): Promise<{ paymentID: string; bkashURL: string }> => {
  const token = await getBkashToken();

  try {
    const { data } = await axios.post<BkashCreateResponse>(
      `${configs.bkash.baseUrl}/tokenized/checkout/create`,
      {
        mode: '0011',
        payerReference: params.payerReference,
        callbackURL: params.callbackURL,
        amount: params.amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: params.merchantInvoiceNumber,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
          'X-APP-Key': configs.bkash.appKey,
        },
      },
    );

    const createSucceeded =
      data.statusCode === '0000' ||
      data.transactionStatus === 'Initiated' ||
      data.status === 'Successful' ||
      data.status === 'Initiated';

    if (!createSucceeded || !data.bkashURL) {
      throw new Error(
        `bKash payment creation failed: ${data.statusMessage ?? data.status ?? data.statusCode ?? 'unknown'}`,
      );
    }

    return { paymentID: data.paymentID, bkashURL: data.bkashURL };
  } catch (err) {
    throw sanitizeBkashError(err, 'Failed to create bKash checkout session');
  }
};

export const executeBkashPayment = async (
  paymentID: string,
): Promise<{ transactionId: string; senderNumber: string; receiverNumber: string; amount: number }> => {
  const token = await getBkashToken();

  try {
    const { data } = await axios.post<BkashExecuteResponse>(
      `${configs.bkash.baseUrl}/tokenized/checkout/execute`,
      { paymentID },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
          'X-APP-Key': configs.bkash.appKey,
        },
      },
    );

    const executeSucceeded =
      data.statusCode === '0000' ||
      data.transactionStatus === 'Completed' ||
      data.status === 'Completed' ||
      data.status === 'Successful';

    if (!executeSucceeded || !data.trxID) {
      throw new Error(
        `bKash payment execution failed: ${data.statusMessage ?? data.transactionStatus ?? data.status ?? data.statusCode ?? 'unknown'}`,
      );
    }

    return {
      transactionId: data.trxID ?? (data.transactionId as string),
      senderNumber:
        data.customerMsisdn ?? (data.senderNumber as string) ?? '',
      receiverNumber: (configs.bkash.merchantNumber as string) ?? '',
      amount: parseFloat(data.amount),
    };
  } catch (err) {
    throw sanitizeBkashError(err, 'Failed to execute bKash payment');
  }
};

export const queryBkashPayment = async (
  paymentID: string,
): Promise<BkashQueryStatusResponse> => {
  const token = await getBkashToken();

  try {
    const { data } = await axios.post<BkashQueryStatusResponse>(
      `${configs.bkash.baseUrl}/tokenized/checkout/payment/status`,
      { paymentID },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: token,
          'X-APP-Key': configs.bkash.appKey,
        },
      },
    );

    return data;
  } catch (err) {
    throw sanitizeBkashError(err, 'Failed to query bKash transaction status');
  }
};
