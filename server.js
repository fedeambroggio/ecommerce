const express = require('express');
const handlebars = require('express-handlebars')
const compression = require('compression')
const passport = require('passport');
const expressSession = require('express-session');
const appConfig = require('./app/config/app.conf.js');

// Initialize mongodb
require('./app/database/init.js');

// Initialize Passport
const initPassport = require('./app/passport/init.js');
initPassport(passport);

//Creates and config our express server
const app = express();
const port = 8080;
app.use(compression())
app.use(express.static('public')) //Serves static files (Used to import css files)
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'index-primary',
    //new configuration parameter
    partialsDir: __dirname + '/app/views/partials/'
}));

app.set('view engine', 'handlebars');
app.set('views', './app/views');
app.use(expressSession({
    secret: appConfig.session.secret,
    resave: true,
    saveUninitialized: true
  }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());  // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies



//Receive routes
const authRoutes = require('./app/routes/Auth.routes.js')(passport);
const appRoutes = require('./app/routes/App.routes.js')();
const APIRoutes = require('./app/routes/API.routes.js')();

app.use('/', authRoutes);
app.use('/', appRoutes);
app.use('/api', APIRoutes);

//Makes the app listen to port 3000
const server = app.listen(port, () => console.log(`App listening to port ${server.address().port}`));