require('dotenv').config()
const logger = require('../utils/logger.js');
const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    }
});

module.exports = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        logger.log({level: "info", message: `Email sent: ${info.accepted}`})
    } catch(err) {
        logger.log({level: "warn", message: `Error while sending email: ${err}`})
    }
}