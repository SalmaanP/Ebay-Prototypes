var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var passport = require('passport');
var passport_next  = require('./config/passport');
require('./config/passport')(passport);
// require('../Ebay_server/services/mongoose');
// require('../Ebay_server/server');


var bid_task = require('node-cron');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');

var log = require('./routes/user_tracking');

var controller = require('./routes/controller');

var mq_client = require('./rpc/client');





// var test = require('./routes/test');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

log.openLogs();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// mysql_dao.initPool();
var once = false;
var task = bid_task.schedule('*/10 * * * * *', function() {

    if(!once){
        console.log('Cron Started');
        once = true;
    }

    var msg_payload = {"current_time":Date.now()};
    mq_client.make_request('updateBids_queue', msg_payload, function(err, result){
        if(err){
            console.log('error in updating bids app js');
            console.log(err);
        }
    });

}, false);
// task.start();


var mongoose = require('mongoose');
var sess = require('express-session');
var mongosession = require('connect-mongo')(sess);

app.use(session({
    resave: false,
    saveUninitialized: false,
    cookieName : 'session',
    secret : ' ',
    duration : 1000 * 60 * 30,
    activeDuration : 1000 * 60 * 15,
    /*
    store: new mongosession({url: 'mongodb://localhost/ebay'})
    */
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
app.use('/users', users);

//app.get('/test', test.testquery);
app.get('/', controller.renderRootPage);                          //RENDER
app.get('/home',controller.renderHomePage);                       //RENDER
app.get('/login',controller.renderLoginPage);                     //RENDER
app.get('/advertisements/*',controller.renderAdPage);             //RENDER
app.get('/postad',controller.renderNewAdPage);                    //RENDER
app.post('/register', controller.register);                       //DATA
// app.post('/signin', controller.signin);                           //DATA

app.post('/signin', function(req, res, next) {

    passport.authenticate('local', function(err, user) {

        if(user) {
            controller.signin(req, res, user);
        } else{
            res.code = 500;
            res.end();
        }



    })(req, res, next);
});


app.get('/getRecentAds', controller.getRecentAds);                //DATA
app.get('/getAdDetail/:ad_id', controller.getAd);                 //DATA
app.post('/addAd', controller.addItem);                           //DATA
app.get('/getSellerInfo/:seller_id',controller.getSellerInfo);    //DATA
app.get('/signOut',controller.signOut);                           //DATA
app.get('/profile/*', controller.renderProfilePage);              //RENDER
app.get('/cart', controller.renderCart);                          //RENDER
app.get('/getCart',controller.getCart);                           //DATA
app.post('/addToCart', controller.addToCart);                     //DATA
app.post('/editCart', controller.editCart);                       //DATA
app.post('/removeFromCart', controller.removeFromCart);           //DATA
app.post('/checkout',controller.checkout);                        //DATA
app.get('/fetchUserOrders/:handle', controller.fetchUserOrders);  //DATA
app.get('/fetchUserAds/:handle', controller.fetchUserAds);        //DATA
app.get('/fetchUserBids/:handle', controller.fetchUserBids);      //DATA
app.post('/addBid', controller.addBid);                           //DATA
app.get('/identify', controller.getIdentity);                     //DATA
app.get('/myOrders', controller.renderOrderHistory);              //RENDER
app.get('/myBids', controller.renderBidHistory);                  //RENDER
app.get('/myAds', controller.renderUserAds);                      //RENDER
app.post('/editProfile', controller.editProfile);                 //DATA
app.post('/getItemBids', controller.getItemBids);                 //DATA
app.post('/getMaxBid', controller.getMaxBid);                     //DATA
app.post('/search', controller.searchItems);                      //DATA
app.get('/test', controller.testquery);                          //DATA

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;

