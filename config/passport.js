import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import bcrypt from "bcryptjs";
import UserRepository from "../repository/user.repository.js";

// Local Strategy (Login)
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
          return done(null, false, { message: "Email is not registered" });
        }
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
          return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false, { message: "Internal server error" });
      }
    }
  )
);

// JWT Strategy (Protect routes)
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || "secret",
    },
    async (jwt_payload, done) => {
      try {
        const user = await UserRepository.findById(jwt_payload.id);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        return done(null, user);
      } catch (err) {
        return done(err, false, { message: "Internal server error" });
      }
    }
  )
);

export default passport;
