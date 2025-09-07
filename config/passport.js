const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const AppleStrategy = require("passport-apple").Strategy;
const InstagramStrategy = require("passport-instagram").Strategy;
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const OAuth2Strategy = require("passport-oauth2").Strategy;

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log("Authenticating user:", email);
        const user = await User.findOne({
          email,
          providers: { $elemMatch: { name: "local" } },
        });
        console.log("User found:", user ? user : "No user found");
        if (!user) {
          return done(null, false, { message: "Incorrect email or password" });
        }

        const isMatch = await user.correctPassword(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Incorrect email or password" });
        }
        if (!user.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOrCreate({
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0]?.value,
          provider: {
            name: "google",
            providerId: profile.id,
          },
        });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "photos", "email"],
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await User.findOrCreate({
          email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
          name: profile.displayName,
          avatar: profile.photos?.[0]?.value,
          provider: {
            name: "facebook",
            providerId: profile.id,
          },
        });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Instagram Strategy
// passport.use(
//   new InstagramStrategy(
//     {
//       clientID: process.env.INSTAGRAM_CLIENT_ID,
//       clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
//       callbackURL: process.env.INSTAGRAM_CALLBACK_URL,
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ "instagram.id": profile.id });
//         if (!user) {
//           user = await User.create({
//             name: profile.displayName || profile.username,
//             instagram: {
//               id: profile.id,
//               username: profile.username,
//               photo:
//                 profile.photos && profile.photos[0] && profile.photos[0].value,
//             },
//             isVerified: true,
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

passport.use(
  "instagram",
  new OAuth2Strategy(
    {
      authorizationURL: "https://www.instagram.com/oauth/authorize",
      tokenURL: "https://api.instagram.com/oauth/access_token",
      clientID: process.env.INSTAGRAM_APP_ID,
      clientSecret: process.env.INSTAGRAM_APP_SECRET,
      callbackURL: process.env.INSTAGRAM_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // The generic OAuth2Strategy does not fetch a profile by default.
      // We must do it manually here using the accessToken.
      try {
        const userProfileUrl = `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`;
        const response = await axios.get(userProfileUrl);
        const userProfile = response.data;

        // In a real application, you would find or create a user in your database.
        // For this example, we'll create a user object to pass to the session.
        const user = {
          id: userProfile.id,
          username: userProfile.username,
          accessToken: accessToken,
        };

        // The 'done' callback signals to Passport that authentication is complete.
        return done(null, user);
      } catch (error) {
        console.error("Error fetching user profile from Instagram:", error);
        return done(error, null);
      }
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "email"],
      passReqToCallback: true, // Basic fields from Facebook
    },
    // This is the "verify" callback
    async function (accessToken, refreshToken, profile, done) {
      // accessToken is from Facebook. We use it to query for the Instagram account.
      try {
        // Use the accessToken to get the user's linked pages/accounts
        const accountsUrl = `https://graph.facebook.com/me/accounts?access_token=${accessToken}&fields=instagram_business_account{id,username,profile_picture_url}`;

        const response = await axios.get(accountsUrl);
        const accounts = response.data.data;

        // Find the account that has an Instagram Business Account linked
        const instagramAccount = accounts.find(
          (acc) => acc.instagram_business_account
        );

        if (instagramAccount) {
          // Attach the Instagram profile to the main Facebook profile
          profile.instagram = instagramAccount.instagram_business_account;
        }

        console.log("Authenticated Facebook Profile:", profile);
        if (profile.instagram) {
          console.log("Linked Instagram Business Profile:", profile.instagram);
        }

        // Here, you would find or create a user in your database
        // using profile.id (Facebook ID) and/or profile.instagram.id (Instagram ID)
        return done(null, profile);
      } catch (error) {
        console.error(
          "Error fetching Instagram account:",
          error.response ? error.response.data : error.message
        );
        return done(error);
      }
    }
  )
);

module.exports = passport;
