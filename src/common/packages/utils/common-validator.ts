import { ValidationUtils } from ".";
import ValidationErrors from "./validation-error";

export interface IValidateFieldInput {
  value: any;
  attributes: IFieldAttributes;
}

export interface IFieldAttributes {
  fieldName: string;
  type: "string" | "number" | "boolean" | "stringarray" | "numberarray" | "enum" | "regexp";
  regex?: RegExp;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  message?: string;
  enumValues?: string[];
}

export const checkAndThrowError = (errors: ValidationErrors) => {
  if (errors.hasErrors()) {
    throw errors;
  }
};

export const validateAndReturnErrors = (inputFields: IValidateFieldInput[], currentErrors?:ValidationErrors): ValidationErrors => {
  const errors = currentErrors ?? new ValidationErrors();
  inputFields.forEach((inputField) => {
    const { value: fieldValue, attributes: fieldAttributes } = inputField;
    if (fieldAttributes.type === "string") {
      stringValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "number") {
      numberValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "boolean") {
      booleanValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "stringarray") {
      stringArrayValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "numberarray") {
      numberArrayValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "enum") {
      enumValueValidator(fieldValue, fieldAttributes, errors);
    } else if (fieldAttributes.type === "regexp") {
      regexValidator(fieldValue, fieldAttributes, errors);
    }
  });
  return errors;
  // checkAndThrowError(errors);
};

export const validateAndThrowError = (inputFields: IValidateFieldInput[], inputErrors?: ValidationErrors) => {
  const errors = validateAndReturnErrors(inputFields, inputErrors);
  checkAndThrowError(errors);
};

export const stringValidator = (value: string, fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isNotEmptyAndValidString(value, fieldAttributes.regex!)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid number field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const numberValidator = (value: number, fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidNumber(value, fieldAttributes.minValue, fieldAttributes.maxValue)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "Invalid number field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const booleanValidator = (value: boolean, fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidBoolean(value)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid boolean field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const stringArrayValidator = (value: string[], fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidStringArray(value, fieldAttributes.regex!)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid string array field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const numberArrayValidator = (value: number[], fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidNumberArray(value, fieldAttributes.minValue, fieldAttributes.maxValue)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid number array field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const enumValueValidator = (value: string, fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidEnumValue(value, fieldAttributes.enumValues!)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid enum field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

export const regexValidator = (value: string, fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
  if (!ValidationUtils.isValidRegex(value)) {
    errors.addError(
      `${fieldAttributes.fieldName}`,
      fieldAttributes?.message || "invalid enum field",
      `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
    );
  }
};

// export const tupleValidator = (value: any[], fieldAttributes: IFieldAttributes, errors: ValidationErrors) => {
//   if (!ValidationUtils.isValidTuple(value, fieldAttributes.regex!)) {
//     errors.addError(
//       `${fieldAttributes.fieldName}`,
//       fieldAttributes?.message || "invalid tuple field",
//       `ERR_INVALID_${fieldAttributes.fieldName.toUpperCase()}`
//     );
//   }
// }
