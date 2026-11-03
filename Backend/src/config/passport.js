import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/users.model.js";

async function uniqueUsername(displayName) {
    const base = displayName?.trim().replace(/\s+/g, "_") || "google_user";
    let username = base;
    let suffix = 1;

    while (await userModel.exists({ username })) {
        username = `${base}_${suffix++}`;
    }

    return username;
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (_accessToken, _refreshToken, profile, done) => {
    try {
        let user = await userModel.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("Google account did not provide an email"));

        if (profile.emails?.[0]?.verified === true) {
            user = await userModel.findOne({ email });
            if (user) {
                user.googleId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        user = await userModel.create({
            googleId: profile.id,
            username: await uniqueUsername(profile.displayName),
            email,
            role: "user"
        });
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));
