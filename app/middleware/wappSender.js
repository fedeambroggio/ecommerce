require('dotenv').config()
const logger = require('../utils/logger.js');

const ADMIN_PHONE = process.env.ADMIN_PHONE;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);

const sendWappToAdmin = async (body) => {
    const options = {
        body: body, 
        from: "whatsapp:+14155238886",
        to: `whatsapp:+${ADMIN_PHONE}`
    }

    client.messages
        .create(options)
        .then(message => { logger.log({ level: "info", message: `Whatsapp sent: ${message.sid}` }) })
        .catch((err) => { logger.log({ level: "info", message: `Whatsapp not sent: ${err}` }) });
}

const sendWappToCustomer = async (body, userPhone) => {
    const options = {
        body: body,
        from: "whatsapp:+14155238886",
        to: `whatsapp:+${userPhone}`
    }

    client.messages
        .create(options)
        .then(message => { logger.log({ level: "info", message: `Whatsapp sent: ${message.sid}` }) })
        .catch((err) => { logger.log({ level: "info", message: `Whatsapp not sent: ${err}` }) });
}

module.exports = {sendWappToAdmin, sendWappToCustomer}