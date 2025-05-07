import Activity from '../models/Activity.js';

export const requestLogger = async (req, res, next) => {
  // Get original send function
  const oldSend = res.send;
  
  // Get timestamp when request starts
  const startTime = Date.now();
  
  // Get request info
  const requestInfo = {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    ip: req.ip,
    userId: req.user?.userId,
    role: req.user?.role
  };

  // Override send function to log response
  res.send = function(data) {
    // Get response time
    const responseTime = Date.now() - startTime;

    // Log activity if user is authenticated
    if (req.user) {
      const activityName = `${req.method} ${req.path}`;
      Activity.log(req.user.userId, req.user.role, activityName).catch(err => {
        console.error('Error logging activity:', err);
      });
    }

    // Log request/response info
    console.log({
      timestamp: new Date().toISOString(),
      request: requestInfo,
      responseTime,
      status: res.statusCode
    });

    // Call original send
    oldSend.apply(res, arguments);
  };

  next();
};

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  console.error({
    timestamp: new Date().toISOString(),
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status
    },
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      ip: req.ip,
      userId: req.user?.userId,
      role: req.user?.role
    }
  });
  
  next(err);
};