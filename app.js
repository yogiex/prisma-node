require('dotenv').config
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override')
const flash = require('express-flash')
const session = require('express-session')

// const httpServer = require('http').createServer(app)
// const io = require('socket.io')(httpServer,{
//   path: '/'
// })
//prisma
const {PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient()

const passport = require('passport')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const homeRouter = require('./routes/home')
const dashboardRouter = require('./routes/dashboard')
const adminRouter = require('./routes/linktree')

var app = express(); //create express instance

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave:true,
  saveUninitialized: true,
}))
app.use(methodOverride('_method'))
app.use(passport.initialize())
app.use(passport.session())

//routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/home', homeRouter)
app.use('/dashboard', dashboardRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{title:'404 Page'});
});

module.exports = app;
