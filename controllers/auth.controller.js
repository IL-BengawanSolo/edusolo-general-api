import passport from "../config/passport.js";

import {
  generateJwtToken,
  registerUser,
  updateLastLogin,
} from "../services/auth.service.js";

export const login = (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    async (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ success: false, message: info?.message || "Unauthorized" });

      await updateLastLogin(user.id);
      const token = generateJwtToken(user);

      res.json({
        success: true,
        data: {
          token: "Bearer " + token,
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
          },
        },
      });
    }
  )(req, res, next);
};

export const me = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  })(req, res, next);
};

export const register = async (req, res) => {
  try {
    await registerUser(req.body);
    res.status(201).json({ success: true, message: "Registration successful" });
  } catch (error) {
    const status = error.message === "Email already registered" ? 409 : 400;
    res.status(status).json({ success: false, message: error.message });
  }
};
