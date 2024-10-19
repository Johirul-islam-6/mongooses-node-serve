import { Response } from 'express';

type IapiResponse<T> = {
  statusCode: number;
  success: boolean;
  data?: T | null;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  message?: string | null;
};

// constom sendREsponse
export const sendResponse = <T>(res: Response, data: IapiResponse<T>): void => {
  const responseData: IapiResponse<T> = {
    statusCode: data.statusCode,
    success: data.success,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
    message: data.message || null,
  };

  res.status(data.statusCode).json(responseData);
};
