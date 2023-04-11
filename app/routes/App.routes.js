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
                        res.render('products/products', { products: responseProducts.data.data, cartId: responseCart.data.data[0]['_id'] });
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
            .then(response => {
                res.render('cart/cart', {cartId: response.data.data[0]._id});
            })
            .catch(err => {
                logger.log({level: "warn", message: `There was a problem getting cart ID: ${err}`})
            });
    });
    return router;
}