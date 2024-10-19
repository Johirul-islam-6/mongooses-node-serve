import { MongoServerError } from 'mongodb';
import httpStatus from 'http-status';
import { ApiError } from '../errors/ApiError';

export const handleMongoError = (error: any, text1: string, text2: string) => {
  if (error instanceof MongoServerError && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      ` ${value} ${text1} ${text2} ${field}.`,
      ''
    );
  } else {
    // If it's not a duplicate key error, rethrow the original error
    throw error;
  }
};
