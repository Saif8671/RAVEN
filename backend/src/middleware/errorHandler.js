import { v4 as uuidv4 } from 'uuid';

export function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    traceId: uuidv4(),
  });
}
