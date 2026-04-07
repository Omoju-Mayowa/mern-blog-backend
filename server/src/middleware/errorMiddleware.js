// Unsupported (404) routes
const notFound = (req, res, next) => {
  // silence health check pings
  if (req.originalUrl === '/kaithhealthcheck') {
    return res.status(200).json({ status: 'ok' });
  }
  const error = new Error(`Page Not Found - ${req.originalUrl}`);
  error.code = 404;
  next(error);
};

// Middleware to handle errors
const errorHandler = (error, req, res, next) => {
    if(res.headerSent) {
        return next(error)
    }

    res.status(error.code || 500).json({message: error.message || "An unknown error occured"})
}

export {notFound, errorHandler}