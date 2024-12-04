const asyncHandler = (requestHandler) => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(requestHandler(req, res, next));
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
