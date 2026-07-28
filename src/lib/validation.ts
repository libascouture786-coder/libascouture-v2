export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[+]?[\d\s\-()]{10,15}$/;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
export const MAX_FILES = 6;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export type ValidationResult = { valid: boolean; error?: string };

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) return { valid: false, error: 'Email is required' };
  if (!EMAIL_REGEX.test(email)) return { valid: false, error: 'Please enter a valid email address' };
  return { valid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone.trim()) return { valid: false, error: 'Mobile number is required' };
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Please enter a valid mobile number (10–15 digits)' };
  }
  return { valid: true };
}

export function validateRequired(value: string, label: string): ValidationResult {
  if (!value.trim()) return { valid: false, error: `${label} is required` };
  return { valid: true };
}

export function validateFile(
  file: File,
  { maxSize = MAX_FILE_SIZE, allowedTypes = ALLOWED_IMAGE_TYPES }: { maxSize?: number; allowedTypes?: string[] } = {},
): ValidationResult {
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File "${file.name}" exceeds the ${mb}MB limit` };
  }
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File "${file.name}" is not an allowed type` };
  }
  return { valid: true };
}

export function validateFiles(
  files: File[],
  { maxCount = MAX_FILES, maxSize = MAX_IMAGE_SIZE, allowedTypes = ALLOWED_IMAGE_TYPES }: { maxCount?: number; maxSize?: number; allowedTypes?: string[] } = {},
): ValidationResult {
  if (files.length > maxCount) {
    return { valid: false, error: `Maximum ${maxCount} files allowed` };
  }
  for (const file of files) {
    const result = validateFile(file, { maxSize, allowedTypes });
    if (!result.valid) return result;
  }
  return { valid: true };
}

export function sanitizeText(value: string, maxLength = 2000): string {
  return value.slice(0, maxLength).trim();
}

export function fieldId(formPrefix: string, fieldName: string): string {
  return `${formPrefix}-${fieldName}`;
}

export function errorProps(formPrefix: string, fieldName: string, error?: string) {
  const id = `${formPrefix}-${fieldName}-error`;
  return {
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': error ? id : undefined,
    'data-error-id': id,
  };
}
