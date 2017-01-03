var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var bid_task = require('node-cron');
var mysql = require('mysql');

var routes = require('./routes/index');
var users = require('./routes/users');

var log = require('./routes/user_tracking');

var mysql_controller = require('./routes/mysql_controller');
var mysql_dao = require('./routes/mysql_dao');
// var test = require('./routes/test');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

log.openLogs();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// mysql_dao.initPool();

var task = bid_task.schedule('*/5 * * * * *', function() {

    // console.log('running cron');
    var current_time = Date.now();
    mysql_dao.updateBids(current_time, function(err, rows){

    })

}, false);
task.start();




app.use(session({
    cookieName : 'session',
    secret : ' ',
    duration : 1000 * 60 * 30,
    activeDuration : 1000 * 60 * 15
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
app.use('/users', users);

//app.get('/test', test.testquery);
app.get('/', mysql_controller.renderRootPage);                          //RENDER
app.get('/home',mysql_controller.renderHomePage);                       //RENDER
app.get('/login',mysql_controller.renderLoginPage);                     //RENDER
app.get('/advertisements/*',mysql_controller.renderAdPage);             //RENDER
app.get('/postad',mysql_controller.renderNewAdPage);                    //RENDER
app.post('/register', mysql_controller.register);                       //DATA
app.post('/signin', mysql_controller.signin);                           //DATA
app.get('/getRecentAds', mysql_controller.getRecentAds);                //DATA
app.get('/getAdDetail/:ad_id', mysql_controller.getAd);                 //DATA
app.post('/addAd', mysql_controller.addItem);                           //DATA
app.get('/getSellerInfo/:seller_id',mysql_controller.getSellerInfo);    //DATA
app.get('/signOut',mysql_controller.signOut);                           //DATA
app.get('/profile/*', mysql_controller.renderProfilePage);              //RENDER
app.get('/cart', mysql_controller.renderCart);                          //RENDER
app.get('/getCart',mysql_controller.getCart);                           //DATA
app.post('/addToCart', mysql_controller.addToCart);                     //DATA
app.post('/editCart', mysql_controller.editCart);                       //DATA
app.post('/removeFromCart', mysql_controller.removeFromCart);           //DATA
app.post('/checkout',mysql_controller.checkout);                        //DATA
app.get('/fetchUserOrders/:handle', mysql_controller.fetchUserOrders);  //DATA
app.get('/fetchUserAds/:handle', mysql_controller.fetchUserAds);        //DATA
app.get('/fetchUserBids/:handle', mysql_controller.fetchUserBids);      //DATA
app.post('/addBid', mysql_controller.addBid);                           //DATA
app.get('/identify', mysql_controller.getIdentity);                     //DATA
app.get('/myOrders', mysql_controller.renderOrderHistory);              //RENDER
app.get('/myBids', mysql_controller.renderBidHistory);                  //RENDER
app.get('/myAds', mysql_controller.renderUserAds);                      //RENDER
app.post('/editProfile', mysql_controller.editProfile);                 //DATA
app.post('/getItemBids', mysql_controller.getItemBids);                 //DATA
app.post('/getMaxBid', mysql_controller.getMaxBid);                     //DATA
app.post('/search', mysql_controller.searchItems);                      //DATA

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

