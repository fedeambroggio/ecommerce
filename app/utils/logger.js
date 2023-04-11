const winston = require('winston');

// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6
// };

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ), 
    level: 'info', //Log only if info.level is less than or equal to this level
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'warn.log', level: 'warn' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
    ],
});

module.exports = logger