import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const { email, password, username } = req.body;
    const user = await authService.register(email, password, username);

    res.status(201).json({
      success: true,
      data: {
        id: user[0].id,
        email: user[0].email,
        username: user[0].username,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.login(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    res.json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies.refreshToken;

    if (!token)
      return res.status(401).json({
        success: false,
        error: {
          code: "NO_REFRESH_TOKEN",
          message: "Refresh token not provided",
        },
      });

    const { accessToken, refreshToken } = await authService.refreshToken(token);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: "/",
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;
    if (token) await authService.deleteRefreshToken(token);

    res.clearCookie("refreshToken", { path: "/" });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: {
        ...user,
      },
    });
  } catch (err) {
    next(err);
  }
}
