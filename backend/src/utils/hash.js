import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt with the given salt rounds and returns the result
 * @param {string} password The password to be hashed
 * @returns A promise to be either resolved with the encrypted data salt or rejected with an Error
 */
export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Password comparison using bcrypt and returns the result
 * @param {string} password given password to be compared
 * @param {string} hash hashed password from database
 * @returns A promise to be either resolved with the comparison result salt or rejected with an Error
 */
export function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
