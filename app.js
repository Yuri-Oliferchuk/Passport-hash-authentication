import 'dotenv/config';                                     //add .env file
import bodyParser from 'body-parser';                       //add body-parser
import express from 'express';                              //add express
import session from 'express-session';                      //add express-session
import passport from 'passport';                            //add pasport
import LocalStrategy from 'passport-local';                 //add pasport-local lirary
import bcrypt from 'bcrypt';                                //add dcrypt
import {users, findByUsername, findById} from './db.js'     //connect file with user object 

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

//function for redirect if user not loged in
const redirectLogin = (req, res, next) => {
  if(!req.user) {
      res.redirect('/login');
  } else {
      next();
  }
}

//function for redirect if user authorized
const redirectHome = (req, res, next) => {
  if(req.user) {
      res.redirect('/home');
  } else {
      next();
  }
}

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

//add routers
app.get('/', (req, res) => {
  const {id} = req.user || 0;

  res.send(`
      <h1>Welcome!!!</h1>
      ${id ? `
          <a href = '/home'>Home</a>
          <form method='post' action='/logout'>
              <button>Logout</button>
          </form>
          ` : `
          <a href = '/login'>Login</a>
          <a href = '/register'>Register</a>
      `}
  `)
});

app.get('/home', redirectLogin, (req, res) => {
  res.render('home', {name: req.user.name, email: req.user.username})
});

app.get('/login', redirectHome, function(req, res, next) {
  res.render('login')
})

app.get('/register', redirectHome, (req, res) => {
  res.render('register')
})

app.post('/login', 
        passport.authenticate('local', {failureRedirect: '/login'}), 
        (req, res) => {
          res.redirect('/home');
});

app.post('/register', async (req, res, next) => {
  const {name, username, password} = req.body;

  if (name&&username&&password) {
      const exist = users.some(
          user => user.username === username
      )

      // Generate salt
      const salt = await bcrypt.genSalt(10);
      // Hash password
      const hashedPassword = await bcrypt.hash(password, salt);
            
      if (!exist) {
          const user = {
              id: users.length + 1,
              name: name,
              username: username,
              password: hashedPassword,
              salt: salt,
          };
          users.push(user);

          req.login(user, function(err) {
            if (err) { return next(err); }
          });
          return res.redirect('/home')
      }
  }
  return res.redirect('/register'); // if any errors
});

app.post('/logout', redirectLogin, (req, res) => {
  req.logout();
  res.redirect('/login');
});

//start server listening
app.listen(port, console.log(
  `http://test:${port}`
))