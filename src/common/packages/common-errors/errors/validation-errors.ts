export default class ValidationErrors extends Error {
  private fieldErrors: FieldError[];

  constructor(message = "Validation errors") {
    super(message);
    this.fieldErrors = [];
  }

  private addFieldError(fieldError: FieldError) {
    this.fieldErrors.push(fieldError);
  }

  addError(field: string, message: string, errorCode: string) {
    this.addFieldError(new FieldError(field, message, errorCode));
  }

  hasErrors() {
    return this.fieldErrors.length > 0;
  }

  toString() {
    return JSON.stringify(this.fieldErrors);
  }
}

class FieldError {
  field: string;
  message: string;
  errorCode: string;

  constructor(field: string, message: string, errorCode: string) {
    this.field = field;
    this.message = message;
    this.errorCode = errorCode;
  }
}