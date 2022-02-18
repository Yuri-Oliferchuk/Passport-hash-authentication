import 'dotenv/config';                                     //add .env file
import './config/passport.js'                               //add passport.js configuration
import bodyParser from 'body-parser';                       //add body-parser
import express from 'express';                              //add express
import session from 'express-session';                      //add express-session
import passport from 'passport';                            //add pasport
import {apiRouter} from './routers/users.js';               //add routers

const app = express();                                      //create express var
const port = process.env.PORT || 3000;                      //create PORT variable
const IN_PROD = process.env.NODE_ENV === 'production';      //create production for secure session

app.set('view engine', 'ejs');                              //set default render

//session config
app.use(session({
  name: process.env.SESS_NAME,
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESS_SECRET,
  cookie: {
    maxAge: 1000*60*60*2,
    sameSite: true,
    secure: IN_PROD,
  }
}))

// Passport Config
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

//parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//import routers
app.use('/', apiRouter);

//start server listening
app.listen(port, console.log(
  `http://test:${port}`
))