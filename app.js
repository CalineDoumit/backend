var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var indexRouter = require('./routes/index');
var nurseRouter = require('./routes/nurseRouter');
var patientRouter = require('./routes/patientRouter');
var robotRouter = require('./routes/robotRouter');
var passport = require('passport');
var authenticate = require('./authenticate');
var config = require('./config');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');

//const Dishes = require('./models/dishes');

//const url = 'mongodb://localhost:27017/RobotServer';
const url = config.mongoUrl;
const connect = mongoose.connect(url,{ useFindAndModify: false });

connect.then(() => { //db : parametre
  console.log("Connected correctly to server");
}, (err) => { console.log(err); });

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/nurses',nurseRouter);
app.use('/patients',patientRouter);
app.use('/robots',robotRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) { //next : parametre
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
