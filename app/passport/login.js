const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User.model.js");
var bCrypt = require("bcrypt");
const logger = require("../utils/logger.js");

module.exports = function (passport) {
    passport.use(
        "login",
        new LocalStrategy(
            {
                usernameField: "email", // Cambia el campo "username" a "email"
            },
            (email, password, done) => {
                User.findOne({ email: email })
                    .then((user) => {
                        // Username does not exist, log error & reject
                        if (!user) {
                            logger.log({level: "info", message: `User Not Found with email: ${email}`})
                            return Promise.reject(null);
                        }
                        // User exists but wrong password, log the error and reject
                        if (!isValidPassword(user, password)) {
                            logger.log({level: "info", message: `Invalid Password for email: ${email}`})
                            return Promise.reject(null);
                        }
                        // User and password both match, resolve with user
                        return Promise.resolve(user);
                    })
                    .then((user) => {
                        logger.log({level: "info", message: `Login successful`})
                        return done(null, user);
                    })
                    .catch((err) => {
                        logger.log({level: "info", message: `Login failed: ${err}`})
                        return done(null, false);
                    });
            }
        )
    );

    var isValidPassword = function (user, password) {
        return bCrypt.compareSync(password, user.password);
    };
};
