/* eslint-disable no-unused-expressions */

import { IGenericErrorMassage } from './../../interfaces/GlobalError';
import { ErrorRequestHandler } from 'express';
import { handleValidationError } from '../../errors/handelValidationError';
import config from '../../config';
import { ApiError } from '../../errors/ApiError';
import { ZodError } from 'zod';
import handleZodError from '../../errors/handleZodError';
import { handleCastError } from '../../errors/handleCastError';
// import { logger } from '../../shared/logger';

export const globalErrorHandeler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
) => {
  //when development or production project

  config.evn === 'development'
    ? // eslint-disable-next-line no-console
      console.log('Project Run Development Mode ~ ', error)
    : console.log('Project Run Production Mode ~ ', error);

  let statusCode = 500;
  let message = 'somting went wront !';
  let errorMessages: IGenericErrorMassage[] = [];

  if (error?.name === 'ValidatorError') {
    const simpliFieldError = handleValidationError(error);
    statusCode = simpliFieldError.statusCode;
    message = simpliFieldError.message;
    errorMessages = simpliFieldError.errorMessages;
  } else if (error instanceof ZodError) {
    const simpliFieldError = handleZodError(error);
    statusCode = simpliFieldError.statusCode;
    message = simpliFieldError.message;
    errorMessages = simpliFieldError.errorMessages;
  } else if (error?.name === 'CastError') {
    const simpliFieldError = handleCastError(error);
    statusCode = simpliFieldError.statusCode;
    message = simpliFieldError.message;
    errorMessages = simpliFieldError.errorMessages;
  } else if (error instanceof ApiError) {
    statusCode = error?.statusCode;
    message = error?.message;
    errorMessages = error?.message
      ? [
          {
            path: '',
            message: error?.message,
          },
        ]
      : [];
  } else if (error instanceof Error) {
    message = error?.message;
    errorMessages = error.message
      ? [
          {
            path: '',
            message: error.message,
          },
        ]
      : [];
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.evn !== 'production' ? error?.stack : undefined,
  });

  next();
};
