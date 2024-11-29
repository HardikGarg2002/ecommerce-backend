import moment from "moment";
const Email_regex = /^[0-9a-z]+(?:\.[0-9a-z]+)*@[a-z0-9]{2,}(?:\.[a-z]{2,})+$/;
const default_password_regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
const mobile_regex = /^[0-9]{10}$/;
const name_regex = /^[a-zA-Z ]+$/;

const Email_max_length = 255;

export const isNotEmpty = (value: string): boolean => {
  if (value === undefined || value === null || typeof value !== "string" || value.trim().length === 0) {
    return false;
  }

  return true;
};

export const isValidNumber = (
  value: number,
  minValue: number = Number.MIN_SAFE_INTEGER,
  maxValue: number = Number.MAX_SAFE_INTEGER,
  isStringOK: boolean = false
) => {
  if (
    value === undefined ||
    value === null ||
    isNaN(value) ||
    typeof value === "boolean" ||
    (typeof value === "string" && !isStringOK)
  )
    return false;

  return value >= minValue && value <= maxValue;
};

export const isValidNumberArray = (
  values: number[],
  minValue: number = Number.MIN_SAFE_INTEGER,
  maxValue: number = Number.MAX_SAFE_INTEGER
) => {
  if (!_isValidArrayAndNotEmpty(values)) return false;

  return values.every((value) => isValidNumber(value, minValue, maxValue));
};

export const isValidStringArray = (values: string[], regex: RegExp) => {
  if (!_isValidArrayAndNotEmpty(values)) return false;

  return values.every((value) => isNotEmptyAndValidString(value, regex));
};

export const isEmpty = (value: string): boolean => {
  return !isNotEmpty(value);
};

export const isValidBoolean = (value: boolean): boolean => {
  if (value === undefined || value === null) return false;
  return value === true || value === false;
};

export const isNotEmptyAndValidString = (value: string, regex: RegExp): boolean => {
  if (isEmpty(value)) return false;
  return regex.test(value.trim());
};

export const isOptionalAndValidString = (value: string, regex: RegExp): boolean => {
  if (isEmpty(value)) return true;
  return regex.test(value.trim());
};

export const isNotEmptyAndLengthOK = (value: string, max_length: number, min_length = 0): boolean => {
  if (isEmpty(value)) return false;
  return value.length >= min_length && value.length <= max_length;
};

export const isValidEmail = (value: string): boolean => {
  return isNotEmptyAndValidString(value, Email_regex) && isNotEmptyAndLengthOK(value, Email_max_length);
};

export const isValidPassword = (value: string, passwordRegex: RegExp = default_password_regex): boolean => {
  return isNotEmptyAndValidString(value, passwordRegex);
};

export const isValidMobileNumber = (value: string): boolean => {
  return isNotEmptyAndValidString(value, mobile_regex);
};

export const isValidName = (value: string, max_length: number, min_length: number): boolean => {
  return isNotEmptyAndLengthOK(value, max_length, min_length) && isNotEmptyAndValidString(value, name_regex);
};

export const isValidDateFormat = (strDate: string, format: string = "YYYY-MM-DD"): boolean => {
  return moment(strDate, format, true).isValid();
};

export const isValidEnumValue = (value: string, enumValues: string[]): boolean => {
  if (!_isValidArrayAndNotEmpty(enumValues)) {
    throw new Error("enumValues must be an array");
  }
  return enumValues.includes(value);
};

const _isValidArrayAndNotEmpty = (value: any): boolean => {
  if (value === undefined || value === null || !Array.isArray(value) || value.length === 0) return false;
  return true;
};

export const isValidRegex = (pattern: string): boolean => {
  var parts = pattern.split("/"),
    regex = pattern,
    options = "";
  if (parts.length > 1) {
    regex = parts[1];
    options = parts[2];
  }
  try {
    new RegExp(regex, options);
    return true;
  } catch (e) {
    return false;
  }
};

export function isValidRegexValue(regexString: string, value: string): boolean {
  try {
    if (isEmpty(value) || isEmpty(regexString)) return false;
    const regex = new RegExp(regexString);
    return regex.test(value.trim());
  } catch (error) {
    console.log("Regex error is this");
    return false;
  }
}

// console.log(isValidRegexValue("^[as-zA-Z1-9]{3,30}$", true));
// console.log(isValidRegexValue("^[a-zA-Z1-9]{3,30}$", "abc"));
