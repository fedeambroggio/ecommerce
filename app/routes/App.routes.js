const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config()
const logger = require('../utils/logger.js')

const BASE_URL = process.env.BASE_URL;

const isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/login');
}

module.exports = () => {
    /* GET Profile Page */
    router.get('/', isAuthenticated, function (req, res) {
        res.render('profile/profile', { user: req.user });
    });
    /* GET Products Page */
    router.get('/products', isAuthenticated, function (req, res) {
        axios.get(`${BASE_URL}/api/products`)
            .then(responseProducts => {
                axios.get(`${BASE_URL}/api/carts/?email=${req.user.email}`)
                    .then(responseCart => {

                        if (responseCart.data.data.length > 0) { //Si existe un carrito, renderizar
                            res.render('products/products', { products: responseProducts.data.data, cartId: responseCart.data.data[0]['_id'] });
                        } else { //Si no existe un carrito, agregar. Luego renderizar
                            const data = {
                                "email": req.user.email,
                                "products": []
                            }
                            axios.post(`${BASE_URL}/api/carts`, data)
                                .then((response) => {
                                    const newCartId = response.data.data['_id']
                                    logger.log({ level: "info", message: `Cart successfully created. ID: ${newCartId}` })
                                    res.render('products/products', { products: responseProducts.data.data, cartId: newCartId });
                                })
                                .catch(err => {
                                    logger.log({ level: "warn", message: `There was a problem creating the cart: ${err}` })
                                });
                        }

                    })
                    .catch(err => {
                        logger.log({level: "warn", message: `There was a problem getting cart ID: ${err}`})
                    });
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem getting the products: ${err}`})
            });
    });

    /* GET Cart Page */
    router.get('/cart', isAuthenticated, function (req, res) {
        axios.get(`${BASE_URL}/api/carts/?email=${req.user.email}`)
            .then(responseCart => {

                if (responseCart.data.data.length > 0) { //Si existe un carrito, renderizar
                    const cartData = responseCart.data.data[0];
                    
                    if (cartData["products"].length > 0) {
                        let productsKeys = []
                         cartData["products"].forEach(product => {
                            //Access to key of product
                             for (let key in product) {
                                productsKeys.push(key)
                            }                            
                         });
                        
                        axios.get(`${BASE_URL}/api/products/infoByCode?codigos=${productsKeys.join(",")}`)
                            .then(productInfoResponse => {
                                res.render('cart/cart', { cartId: cartData['_id'], productsInfo: productInfoResponse.data.data });
                            })
                            .catch(err => {
                                logger.log({level: "warn", message: `There was a problem getting product info: ${err}`})
                            }); 
                    }

                } else { //Si no existe un carrito, agregar. Luego renderizar
                    const data = {
                        "email": req.user.email,
                        "products": []
                    }
                    axios.post(`${BASE_URL}/api/carts`, data)
                        .then((response) => {
                            const newCartId = response.data.data['_id']
                            logger.log({ level: "info", message: `Cart successfully created. ID: ${newCartId}` })
                            res.render('cart/cart', { cartId: newCartId });
                        })
                        .catch(err => {
                            logger.log({ level: "warn", message: `There was a problem creating the cart: ${err}` })
                        });
                }

            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem getting cart ID: ${err}`})
            });
    });
    return router;
}