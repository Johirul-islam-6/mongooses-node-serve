import mongoose from 'mongoose';
import { IGenericErrorMassage } from '../interfaces/GlobalError';
import { IgenericErrorRespons } from '../interfaces/common';

export const handleValidationError = (
  error: mongoose.Error.ValidationError
): IgenericErrorRespons => {
  const errors: IGenericErrorMassage[] = Object.values(error.errors).map(
    (el: mongoose.Error.ValidatorError | mongoose.Error.CastError) => {
      return {
        path: el?.path,
        message: el?.message,
      };
    }
  );

  const statusCode = 400;
  return {
    statusCode,
    message: 'Validator Error',
    errorMessages: errors,
  };
};
