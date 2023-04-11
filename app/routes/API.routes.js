const express = require('express');
const router = express.Router();
const Product = require("../models/Product.model.js");
const Cart = require("../models/Cart.model.js");
const CRUDService = require("../database/Mongo.database.js");
const logger = require('../utils/logger.js');
const axios = require('axios');
require('dotenv').config()
const { sendWappToAdmin, sendWappToCustomer } = require('../middleware/wappSender.js');

const BASE_URL = process.env.BASE_URL;

const productService = new CRUDService(Product);
const cartService = new CRUDService(Cart);

module.exports = () => {
    /* New user email */
    router.post('/send-email/new-user', function (req, res) {
        require('../middleware/emailSender.js')(req.body);
    });
    /* New order email */
    router.post('/send-email/new-order', function (req, res) {
        require('../middleware/emailSender.js')(req.body);
    });
    /* New order whatsapp admin */
    router.post('/send-wapp/new-order-admin', function (req, res) {
        const {body} = req.body;
        sendWappToAdmin(body)
            .then(() => {
                logger.log({ level: "info", message: `Whatsapp sent to admin` })
            })
            .catch((err) => {
                logger.log({ level: "info", message: 'Error sending whatsapp to admin: ' + err })
            });
    });
    /* New order whatsapp user */
    router.post('/send-wapp/new-order-customer', function (req, res) {
        const { body, userPhone } = req.body;
        sendWappToCustomer(body, userPhone)
            .then(() => {
                logger.log({ level: "info", message: `Whatsapp sent to user` })
            })
            .catch((err) => {
                logger.log({ level: "info", message: 'Error sending whatsapp to user: ' + err })
            });
        });
    /* Get products*/
    router.get('/products', function (req, res) {
        productService.find({})
            .then((products) => {
                logger.log({ level: "info", message: `Products received successfully` })
                res.send({ message: "Products received successfully", data: products })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error retrieving products: ${err}` })
                res.send({message: `Error retrieving products: ${err}`})
            });
    });
    /* Add product */
    router.post('/products', function (req, res) {
        const { nombre, descripcion, codigo, foto, precio, stock } = req.body;
        productService.create({ nombre, descripcion, codigo, foto, precio, stock })
            .then((product) => {
                logger.log({ level: "info", message: `Product saved succesfully: ${product}` })
                res.send({message: `Product saved succesfully: ${product}`})
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Product not saved: ${err}` })
                res.send({message: `Product not saved: ${err}`})
            });
    });


    /* Add cart */
    router.post('/carts', function (req, res) {
        const { email, products } = req.body;
        cartService.create({ email, products })
            .then((cartId) => {
                logger.log({ level: "info", message: `Cart created succesfully. ID: ${cartId._id}` })
                res.send({ message: `Cart created succesfully`, data: cartId })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Cart not created: ${err}` })
                res.send({message: `Cart not created: ${err}`})
            });
    });
    /* Get cart info by email */
    router.get('/carts', function (req, res) {
        const { email } = req.query;
        cartService.find({email: email})
            .then((cartInfo) => {
                logger.log({ level: "info", message: `Cart info received successfully for email: ${email}` })
                res.send({ message: "Cart info received successfully", data: cartInfo })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error retrieving cart info: ${err}` })
                res.send({message: `Error retrieving cart info: ${err}`})
            });
    });
    /* Get cart info by id*/
    router.get('/carts/:id', function (req, res) {
        const { id } = req.params;
        cartService.find({_id: id})
            .then((cartInfo) => {
                logger.log({ level: "info", message: `Cart info received successfully for id: ${id}` })
                res.send({ message: "Cart info received successfully", data: cartInfo })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error retrieving cart info: ${err}` })
                res.send({message: `Error retrieving cart info: ${err}`})
            });
    });
    /* Add product to cart by id */
    router.post('/carts/:id/products', function (req, res) {
        const { products } = req.body;
        const { id } = req.params;

        const productsUpdateData = {
            $push: { products: { $each: products } }, //Propiedades a agregar
            // $pull: { products: { $in: ['product1'] } } //Propiedades a eliminar
        };
          
        cartService.update(id, productsUpdateData)
            .then((cartInfo) => {
                logger.log({ level: "info", message: `Products added to cart successfully` })
                res.send({ message: `Products added to cart successfully`, data: cartInfo })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error adding products to cart: ${err}` })
                res.send({message: `Error adding products to cart: ${err}`})
            });
    });
    return router;
}