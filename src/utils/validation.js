export const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

export const isValidBirthYear = (value) =>
  Number.isInteger(value) && value >= 0 && value <= new Date().getFullYear();

// Accepts YYYY-MM-DD only, and rejects dates that do not exist such as 2026-02-30.
export const isValidDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

// MongoDB duplicate key error, raised by the unique index on `id`.
export const isDuplicateKeyError = (err) => err?.code === 11000;
