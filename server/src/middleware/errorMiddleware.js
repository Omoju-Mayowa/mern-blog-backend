// Unsupported (404) routes
const notFound = (req, res, next) => {
  // silence health check pings
  if (req.originalUrl.includes('healthcheck')) {
     return res.status(200).json({ status: 'ok' });
  }
  const error = new Error(`Page Not Found - ${req.originalUrl}`);
  error.code = 404;
  next(error);
};

// Middleware to handle errors
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  // don't log 404s — they're just noise
  if (error.code !== 404) {
    console.error(error);
  }
  res.status(error.code || 500).json({
    message: error.message || "An unknown error occurred"
  });
};

export {notFound, errorHandler}