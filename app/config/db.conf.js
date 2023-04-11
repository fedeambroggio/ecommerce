require('dotenv').config()

const DB_NAME_AUTH = process.env.DB_NAME_AUTH;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

module.exports = {
    'url': `mongodb+srv://${DB_USER}:${DB_PASS}@learningcluster.henetdi.mongodb.net/${DB_NAME_AUTH}?retryWrites=true&w=majority`
}