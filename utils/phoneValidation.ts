/**
 * Strips all non-digit characters from a string.
 * Use in onChange handlers for phone number inputs.
 */
export function sanitizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Returns true if the phone number is a valid 10-digit number.
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 10;
}

/**
 * Formats a 10-digit phone string as (XXX) XXX-XXXX.
 * Returns the original string if not exactly 10 digits.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Returns true if a name has at least 2 words (first + last).
 */
export function isValidFullName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.split(/\s+/).length >= 2;
}
