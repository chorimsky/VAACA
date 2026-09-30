/**
 * Shared input checks.
 *
 * The client form and `POST /api/applications` must agree on what a valid
 * address and an acceptable password look like; the server re-validates
 * regardless, since a client check is a convenience, not a guarantee. Keeping
 * the minimum length here is what stops the form accepting a password the
 * endpoint will reject.
 */
export const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export const MIN_PASSWORD_LENGTH = 8;

export const isAcceptablePassword = (value: string) =>
  value.length >= MIN_PASSWORD_LENGTH;
