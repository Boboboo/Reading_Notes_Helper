// var mongoose = require('mongoose');
// mongoose.Promise = require('bluebird');

module.exports = function(app, passport) {
// normal routes ===============================================================
    app.get('/', function(req, res) {
        res.render('home.handlebars');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.handlebars', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });


// AUTHENTICATE (FIRST LOGIN) ==================================================
    // locally --------------------------------
        // LOGIN ===============================
        app.get('/login', function(req, res) {
            res.render('login.handlebars', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile',  
            failureRedirect : '/login', 
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        app.get('/signup', function(req, res) {
            res.render('signup.handlebars', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', 
            failureRedirect : '/signup', 
            failureFlash : true 
        }));

    // google -------------------------------
        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            })
        );

// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.handlebars', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', 
            failureRedirect : '/connect/local', 
            failureFlash : true 
        }));

    // google -------------------------------
       // send to google to do the authentication
       app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

       // the callback after google has authorized the user
       app.get('/connect/google/callback',
           passport.authorize('google', {
               successRedirect : '/profile',
               failureRedirect : '/'
           })
       );


// UNLINK ACCOUNTS =============================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future
    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
