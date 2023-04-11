const express = require('express');
const router = express.Router();

module.exports = function (passport) {
    /* GET login page. */
    router.get('/login', function (req, res) {
        // res.render('login/login'); Usar en caso de querer utilizar layout por defecto
      res.render('login/login', {layout : 'index-secondary'});
    });
    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));
    /* GET Registration Page */
    router.get('/signup', function(req, res){
      res.render('signup/signup', {layout : 'index-secondary'});
    });
    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
      successRedirect: '/login',
      failureRedirect: '/signup'
    },));
    /* Handle Logout */
    router.get('/signout',  function(req, res, next) {
      req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/')
      })
    });
  
    // Endpoint to debug
    // router.post('/login', function (req, res, next) {
    //   passport.authenticate('login', function (err, user, info) {
    //       console.log("err", err)
    //       console.log("user", user)
    //       console.log("info", info)
    //       if (err) {
    //         return next(err);
    //       }
    //       if (!user) {
    //         return res.redirect('/login');
    //       }
    //       return res.redirect('/login');
    //     })(req, res, next);
    // });
  
    return router;
  }