const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    try {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const errorMessage = error.errorMessage || "Server Error";

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  };
};

export { asyncHandler };
