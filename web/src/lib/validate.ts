/**
 * Shared input checks.
 *
 * The client form and `POST /api/applications` must agree on what a valid
 * address looks like; the server re-validates regardless, since a client check
 * is a convenience, not a guarantee.
 */
export const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);
