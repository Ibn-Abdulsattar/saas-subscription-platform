class ExpressError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super();
    this.message = message;
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export default ExpressError;












