import { IGenericErrorMassage } from './GlobalError';

export type IgenericErrorRespons = {
  statusCode: number;
  message: string;
  errorMessages: IGenericErrorMassage[];
};

// querys return value interface
export type IGenaricRespons<T> = {
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: T;
};
