require('dotenv').config()

const SESSION_SECRET = process.env.SESSION_SECRET;

module.exports = {
    'session': {
        'secret': SESSION_SECRET
    }
}