export default class APIError extends Error {
  static DEFAULT_ERR_CODE = "ERR_DEFAULT";
  errorCode: string;
  status: number;
  constructor(message: string, errorCode: string, status: number) {
    super(message);
    this.errorCode = errorCode;
    this.status = status;
  }

  static badRequest(message: string, errorCode = APIError.DEFAULT_ERR_CODE) {
    return new APIError(message, errorCode, 400);
  }

  static notFound(message: string, errorCode = APIError.DEFAULT_ERR_CODE) {
    return new APIError(message, errorCode, 404);
  }

  static internal(message: string, errorCode = APIError.DEFAULT_ERR_CODE) {
    return new APIError(message, errorCode, 500);
  }

  static unauthorized(message: string, errorCode = APIError.DEFAULT_ERR_CODE) {
    return new APIError(message, errorCode, 401);
  }

  static forbidden(message: string, errorCode = APIError.DEFAULT_ERR_CODE) {
    return new APIError(message, errorCode, 403);
  }
}
