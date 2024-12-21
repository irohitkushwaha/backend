const ErrorHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const ErrorHandlerUsingPromise = (req, res, next) => {
  return (requestHandler) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) =>
      next(error)
    );
  };
};
