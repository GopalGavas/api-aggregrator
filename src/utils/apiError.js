class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong in the backend",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.data = null;
    this.errors = errors;

    if (this.stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, constructor);
    }
  }
}

export { ApiError };
