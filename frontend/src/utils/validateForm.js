export const validateRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

export const validatePhone = (value) => {
  if (!value) return true; // skip if empty, use required for presence check
  const phoneRegex = /^[0-9]{9,11}$/;
  return phoneRegex.test(value);
};

export const validateEmail = (value) => {
  if (!value) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validatePositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return true;
  return Number(value) >= 0;
};

export const validateStrictlyPositiveNumber = (value) => {
  if (value === null || value === undefined || value === '') return true;
  return Number(value) > 0;
};

