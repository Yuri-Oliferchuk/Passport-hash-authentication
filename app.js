import 'dotenv/config';                                     //add .env file
import bodyParser from 'body-parser';                       //add body-parser
import express from 'express';                              //add express
import session from 'express-session';                      //add express-session
import passport from 'passport';                            //add pasport
import LocalStrategy from 'passport-local';                 //add pasport-local lirary
import bcrypt from 'bcrypt';                                //add dcrypt
import {findByUsername, findById} from './db.js'            //connect file with user object 

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

//set default pasport LocalStrategy
passport.use(
  new LocalStrategy(function verify(username, password, done) {
      findByUsername(username, async function (err, user) {
      password = await bcrypt.hash(password, user.salt);
      const matchedPassword = await bcrypt.compare(password, user.password);
      if (err) return done(err);
      if (!user) return done(null, false);
      if (matchedPassword) { 
                  console.log('wrong password')
                  return done(null, false); }
      return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  findById(id, function (err, user) {
    if (err) {
      return done(err);
    }
    done(null, user);
  });
});

//parse JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

//import routers
import {apiRouter} from './routers/users.js';
app.use('/', apiRouter);

//start server listening
app.listen(port, console.log(
  `http://test:${port}`
))