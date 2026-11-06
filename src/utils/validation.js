export const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

export const isValidBirthYear = (value) =>
  Number.isInteger(value) && value >= 0 && value <= new Date().getFullYear();

// MongoDB duplicate key error, raised by the unique index on `id`.
export const isDuplicateKeyError = (err) => err?.code === 11000;
