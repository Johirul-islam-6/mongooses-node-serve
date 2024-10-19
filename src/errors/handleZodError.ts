import { ZodError, ZodIssue } from 'zod';
import { IgenericErrorRespons } from '../interfaces/common';
import { IGenericErrorMassage } from '../interfaces/GlobalError';

const handleZodError = (error: ZodError): IgenericErrorRespons => {
  const errors: IGenericErrorMassage[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  const statusCode = 400;
  return {
    statusCode,
    message: 'Validator Error',
    errorMessages: errors,
  };
};

export default handleZodError;
