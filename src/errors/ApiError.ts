export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, massage: string | undefined, stack: '') {
    super(massage);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
