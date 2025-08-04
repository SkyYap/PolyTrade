/**
 * Custom error handler middleware for Supabase
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Supabase PostgreSQL errors
  if (err.code === '23505') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Supabase PostgreSQL foreign key constraint
  if (err.code === '23503') {
    const message = 'Foreign key constraint violation';
    error = { message, statusCode: 400 };
  }

  // Supabase PostgreSQL check constraint
  if (err.code === '23514') {
    const message = 'Check constraint violation';
    error = { message, statusCode: 400 };
  }

  // Supabase auth errors
  if (err.message && err.message.includes('JWT')) {
    const message = 'Invalid authentication token';
    error = { message, statusCode: 401 };
  }

  // Supabase RLS (Row Level Security) errors
  if (err.message && err.message.includes('policy')) {
    const message = 'Access denied by security policy';
    error = { message, statusCode: 403 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;