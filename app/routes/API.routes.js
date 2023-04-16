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
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
    /* Get multiple product info by codigo*/
    router.get('/products/infoByCode', function (req, res) {
        const { codigos } = req.query;
        const codigosArray = codigos.split(',');
      
        productService.find({ codigo: { $in: codigosArray } })
            .then((products) => {
                logger.log({ level: "info", message: `Product info successfully` })
                res.send({ message: "Product info received successfully", data: products })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error retrieving product info: ${err}` })
                res.send({ message: `Error retrieving product info: ${err}` })
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


    /* Add cart, and products to it */
    router.post('/carts', function (req, res) {
        const { email, products } = req.body;
        cartService.create({ email, products })
            .then((cartId) => {
                logger.log({ level: "info", message: `Cart created succesfully. ID: ${cartId._id}` })
                res.status(200).send({ message: `Cart created succesfully`, data: cartId })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Cart not created: ${err}` })
                res.status(400).send({message: `Cart not created: ${err}`})
            });
    });
    /* Get cart info by email */
    router.get('/carts', function (req, res) {
        const { email } = req.query;
        cartService.find({email: email})
            .then((cartInfo) => {
                logger.log({ level: "info", message: `Cart info received successfully for email: ${email}` })
                res.status(200).send({ message: "Cart info received successfully", data: cartInfo })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error retrieving cart info: ${err}` })
                res.status(400).send({message: `Error retrieving cart info: ${err}`})
            });
    });
    /* Handle add product to cart from handlebars */
    router.post('/carts/addProduct', function (req, res) {
        const productsToAdd = [req.body]
        // Fix: parse string amount to int for all received products
        productsToAdd.forEach(obj => {
            for(let key in obj) {
              obj[key] = parseInt(obj[key]);
            }
        });

        axios.get(`${BASE_URL}/api/carts/?email=${req.user.email}`)
            .then(response => {

                // Validación simple, ya debería existir un carrito que se crea para cada usuario
                // al navegar a la ruta /cart (*Ver App.routes.js)
                if (response.data.data.length > 0) {
                    const cartId = response.data.data[0]._id;
                    
                    axios.post(`${BASE_URL}/api/carts/${cartId}/products`, {"products": productsToAdd})
                        .then(() => {
                            logger.log({ level: "info", message: `Products successfully added to cart ID: ${cartId}` })
                        })
                        .catch(err => {
                            logger.log({level: "warn", message: `There was a problem adding products to cart ID (${cartId}): ${err}`})
                        });
                } // 
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem getting cart ID: ${err}`})
            });
       
    });
    /* Hanlde finalizar compra from handlebars */
    router.post('/carts/checkout', function (req, res) {
        const bodyAdmin = {
            body: `Nuevo pedido de ${req.user.name}`,
        };
        //Send wapp to admin
        axios.post(`${BASE_URL}/api/send-wapp/new-order-admin`, bodyAdmin)
            .then(() => {
                logger.log({ level: "info", message: `Whats App sent to admin` })
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem sending WhatsApp to admin: ${err}`})
            });

        //Send wapp tu user
        const bodyUser = {
            body: `¡Hola ${req.user.name}! Su pedido ha sido confirmado.`,
            userPhone: `${req.user.phoneNumber}` 
        };
        axios.post(`${BASE_URL}/api/send-wapp/new-order-customer`, bodyUser)
            .then(() => {
                logger.log({ level: "info", message: `WhatsApp sent to user` })
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem sending WhatsApp to user: ${err}`})
            });

        //Send email to admin

        const products = Object.keys(req.body);
        console.log("products", products)
        let productsHtml=""
        products.forEach(product => {
            productsHtml += `<li>${product}: ${req.body.product}</li>`
        })
        const emailBody = {
            from: "My ecommerce",
            to: ADMIN_EMAIL,
            subject: "Nuevo pedido",
            html: `
            <p>Los datos del pedido se presentan a continuación:</p>
            <ul>
                ${productsHtml}
            </ul>
            `,
        }

        axios.post(`${BASE_URL}/api/send-email/new-order`, emailBody)
            .then(() => {
                logger.log({ level: "info", message: `Email sent to admin` })
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem sending email to admin: ${err}`})
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
                res.status(200).send({ message: `Products added to cart successfully`, data: cartInfo })
            })
            .catch((err) => {
                logger.log({ level: "warn", message: `Error adding products to cart: ${err}` })
                res.status(400).send({message: `Error adding products to cart: ${err}`})
            });
    });
    return router;
}