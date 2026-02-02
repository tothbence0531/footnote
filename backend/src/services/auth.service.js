import * as userDao from "../daos/user.dao.js";
import * as refreshTokenDao from "../daos/refreshToken.dao.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken } from "../utils/jwt.js";
import { generateRefreshToken } from "../utils/refreshToken.js";
import {
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  UserAlreadyExistsError,
} from "../utils/authErrors.js";

export async function register(email, password, username) {
  if (!email || !password || !username) throw new MissingCredentialsError();

  const existsByEmail = await userDao.selectUserByEmail(email);
  if (existsByEmail) throw new UserAlreadyExistsError("Email already in use");

  const existsByUsername = await userDao.selectUserByUsername(username);
  if (existsByUsername)
    throw new UserAlreadyExistsError("Username already taken");

  const passwordHash = await hashPassword(password);
  return userDao.insertUser(email, username, passwordHash);
}

export async function login(email, password) {
  const user = await userDao.selectUserByEmail(email);
  if (!user) throw new InvalidCredentialsError();

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) throw new InvalidCredentialsError();

  const accessToken = generateAccessToken({ userId: user.id });

  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await refreshTokenDao.insertRefreshToken(user.id, refreshToken, expiresAt);

  return { accessToken, refreshToken };
}

export async function refreshToken(refreshToken) {
  const stored = await refreshTokenDao.selectRefreshToken(refreshToken);
  if (!stored) throw new InvalidRefreshTokenError();

  if (new Date(stored.expires_at) < new Date()) {
    await refreshTokenDao.deleteRefreshToken(refreshToken);
    throw new InvalidRefreshTokenError("Refresh token expired");
  }

  await refreshTokenDao.deleteRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken({ userId: stored.user_id });

  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await refreshTokenDao.insertRefreshToken(
    stored.user_id,
    newRefreshToken,
    expiresAt,
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export async function deleteRefreshToken(refreshToken) {
  const deleted = await refreshTokenDao.deleteRefreshToken(refreshToken);

  if (!deleted) throw new InvalidRefreshTokenError("Refresh token not found");

  return deleted;
}
