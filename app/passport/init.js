const User = require('../models/User.model.js');
const logger = require('../utils/logger.js');
const login = require('./login.js')
const signup = require('./signup.js')

module.exports = async function(passport){
    passport.serializeUser(function (user, done) {
        logger.log({level: "info", message: `Serializing user: ${user}`})
        done(null, user._id);
    });
    passport.deserializeUser(function(id, done) {
        User.findById(id).lean() //Why .lean() --> https://stackoverflow.com/questions/59690923/handlebars-access-has-been-denied-to-resolve-the-property-from-because-it-is
            .then(user => {
                logger.log({level: "info", message: `Deserializing user: ${user}`})
                done(null, user);
            })
            .catch(err => {
                logger.log({ level: "warn", message: `Deserializing user error: ${err}` })
                done(err, null);
            });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);
}