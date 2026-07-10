import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  
  console.error(`❌ Error [${statusCode}]:`, err.message);

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'error',
    message: `Not Found - ${req.originalUrl}`,
  });
};
