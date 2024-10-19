import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../../errors/ApiError';
import httpStatus from 'http-status';

export const atuthValidationRoute =
  () => async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized',
          ''
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
