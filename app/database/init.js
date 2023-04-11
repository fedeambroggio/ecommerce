const mongoose = require('mongoose');
const dbConfig = require('../config/db.conf.js');
const logger = require('../utils/logger.js');

mongoose.connect(dbConfig['url'], {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => logger.log({level: "info", message: `MongoDB connected`}))
  .catch((err) => logger.log({level: "error", message: `Error connecting to MongoDB: ${err}`}));

module.exports = mongoose.connection;