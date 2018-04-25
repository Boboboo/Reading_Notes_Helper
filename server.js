const express  = require('express');
const app      = express();
const port     = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const settings = require("./config/settings");
const mongoConfig = settings.mongoConfig;
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const statics = express.static(__dirname + '/public');
const configRoutes = require("./routes");

const handlebarsInstance = exphbs.create({
    defaultLayout: "main",
    helpers: {
      asJSON: (obj, spacing) => {
        if (typeof spacing === "number")
          return new Handlebars.SafeString(JSON.stringify(obj, null, spacing));
        return new Handlebars.SafeString(JSON.stringify(obj));
      }
    }
});
  
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
    // If the user posts to the server with a property called _method, rewrite the request's method
    // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
    // rewritten in this middleware to a PUT route
    if (req.body && req.body._method) {
      req.method = req.body._method;
      delete req.body._method;
    }
    // let the next middleware run:
    next();
};


// configuration, connect to database ===============================================================
mongoose.connect(mongoConfig.serverUrl+mongoConfig.database,{ useMongoClient: true });
require('./config/passport')(passport); 

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);
app.use("/public", statics);
app.engine("handlebars", handlebarsInstance.engine);
app.set('view engine', 'handlebars'); // set up handlebars for templating

// required for passport
app.use(session({
    secret: 'pppppokerface', // session secret
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./routes/login_out.js')(app, passport); // load our routes and pass in our app and fully configured passport
configRoutes(app);

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
