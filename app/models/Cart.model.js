const mongoose = require('mongoose');

module.exports = mongoose.model('carritos', {
    products: { type: Array, require: true, default: []},
    timestamp: { type: Date, require: true, default: Date.now },
    email: { type: String, require: true },
})