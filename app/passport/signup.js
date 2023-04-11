const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User.model.js");
const bCrypt = require("bcrypt");
const logger = require('../utils/logger.js');
require('dotenv').config()
const axios = require('axios');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const BASE_URL = process.env.BASE_URL;

module.exports = function (passport) {
    passport.use(
        "signup",
        new LocalStrategy(
            {
                passReqToCallback: true,
                usernameField: "email", // Cambia el campo "username" a "email"
            },
            function (req, email, password, done) {
                findOrCreateUser = function () {
                    // Find a user in Mongo with provided username
                    User.findOne({ email: email })
                        .then(function (user) {
                            if (user) {
                                logger.log({level: "info", message: `User already exists: ${user}`})
                                return done(null, false);
                            } else {
                                var newUser = new User({
                                    email: email,
                                    password: createHash(password),
                                    name: req.body["name"],
                                    address: req.body["address"],
                                    age: req.body["age"],
                                    phoneNumber: req.body["phoneNumber"],
                                    avatarUrl: req.body["avatarUrl"],
                                });
                                
                                return newUser.save()
                                    .then((newUser) => {
                                        
                                        logger.log({level: "info", message: `User saved succesfully: ${newUser}`})
                                        const mailOptions = {
                                            from: "My ecommerce",
                                            to: ADMIN_EMAIL,
                                            subject: "Nuevo registro",
                                            html: `
                                            <p>Los datos del nuevo usuario se presentan a continuación:</p>
                                            <ul>
                                                <li>${newUser.email}</li>
                                                <li>${newUser.name}</li>
                                                <li>${newUser.address}</li>
                                                <li>${newUser.phoneNumber}</li>
                                                <li>${newUser.age}</li>
                                            </ul>
                                            `,
                                        }

                                        axios.post(`${BASE_URL}/api/send-email/new-user`, mailOptions)
                                            .then(res => {
                                                logger.log({level: "info", message: `New user mail sent: ${res.data}`})
                                            })
                                            .catch(err => {
                                                logger.log({level: "warn", message: `New user mail not sent: ${err}`})
                                            });
                                        return done(null, newUser);
                                     });
                            }
                        })
                        .catch(function (err) {
                            logger.log({level: "warn", message: `Error in SignUp: ${err}`})
                            return done(err);
                        });
                };

                // Delay the execution of findOrCreateUser and execute
                // the method in the next tick of the event loop
                process.nextTick(findOrCreateUser);
            }
        )
    );

    // Generates hash using bCrypt
    var createHash = function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};
