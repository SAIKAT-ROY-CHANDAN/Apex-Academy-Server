import { Response } from 'express';

type TMeta = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

type TResponse<T, M = TMeta, S = undefined> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: M;
  data?: T;
  summary?: S;
  token?: {
    accessToken: string;
    refreshToken: string;
  };
};

const sendResponse = <T, M = TMeta, S = undefined>(
  res: Response,
  data: TResponse<T, M, S>,
) => {
  const responseData: TResponse<T, M, S> = {
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    ...(data.meta && { meta: data.meta }),
    ...(data.data && { data: data.data }),
    ...(data.summary && { summary: data.summary }),
  };

  if (data.token) {
    responseData.token = {
      accessToken: data.token.accessToken,
      refreshToken: data.token.refreshToken,
    };
  }
  res.status(data.statusCode).json(responseData);
};

export default sendResponse;