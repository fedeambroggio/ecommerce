const mongoose = require('mongoose');

module.exports = mongoose.model('productos', {
    nombre: { type: String, require: true, max: 100 },
    descripcion: { type: String, require: true, max: 200 },
    codigo: { type: String, require: true, max: 12 },
    foto: { type: String, require: true, max: 200 },
    precio: { type: Number, require: true },
    stock: { type: Number, require: true },
    timestamp: { type: Date, require: true, default: Date.now() },
})