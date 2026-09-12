export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message, code = "BAD_REQUEST") => new HttpError(400, code, message);

export const unauthorized = (message = "Authentication required.", code = "UNAUTHORIZED") =>
  new HttpError(401, code, message);

export const forbidden = (message = "Not allowed.", code = "FORBIDDEN") =>
  new HttpError(403, code, message);

export const notFoundError = (message = "Not found.", code = "NOT_FOUND") =>
  new HttpError(404, code, message);

export const tooManyRequests = (message = "Too many requests.", code = "RATE_LIMITED") =>
  new HttpError(429, code, message);
