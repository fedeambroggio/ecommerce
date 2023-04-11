const mongoose = require('mongoose');

module.exports = mongoose.model('usuarios', {
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    age: {
        type: Number,
        required: true,
    },
    phoneNumber: {
        type: String,
        match: /^\+?(?:[0-9] ?){6,14}[0-9]$/, 
    },
    avatarUrl: {
        type: String,
        required: true,
        trim: true,
    }
})