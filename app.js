import 'dotenv/config';
import bodyParser from 'body-parser';
import express from 'express';
const app = express();

import session from 'express-session';
import {users} from './db.js'
const port = process.env.PORT || 3000;
const IN_PROD = process.env.NODE_ENV === 'production';

const redirectLogin = (req, res, next) => {
  if(!req.session.userId) {
      res.redirect('/login');
  } else {
      next();
  }
}

const redirectHome = (req, res, next) => {
  if(req.session.userId) {
      res.redirect('/home');
  } else {
      next();
  }
}

// Parse JSON request
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

// session config
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

// add routers
app.get('/', (req, res) => {
  const {userId} = req.session;

  res.send(`
      <h1>Welcome!!!</h1>
      ${userId ? `
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
  const user = users.find(
      user => user.id === req.session.userId
  )
  
  res.send(`
      <h1>Home</h1>
      <a href='/'>Main</a>
      <ul>
          <li>Name: ${user.name} </li>
          <li>Email: ${user.email} </li>
      </ul>
  `)
});

app.get('/login', redirectHome, (req, res) => {
  res.send(`
      <h1>Login</h1>
      <form method='post' action'/login'> 
          <input type='email' name='email' placeholder='Email' required />
          <input type='password' name='password' placeholder='Password' required />
          <input type='submit' />
      </form>
      <a href='/register'>Register</a>
  `)
});

app.get('/register', redirectHome, (req, res) => {
  res.send(`
      <h1>Register</h1>
      <form method='post' action'/register'> 
          <input type='name' name='name' placeholder='Name' required />
          <input type='email' name='email' placeholder='Email' required />
          <input type='password' name='password' placeholder='Password' required />
          <input type='submit' />
      </form>
      <a href='/login'>Login</a>
  `)
});

app.post('/login', redirectHome, (req, res) => {
  const {email, password} = req.body;

  if(email&&password) {
      const user = users.find(
          user => user.email === email && user.password === password
      )

      if(user) {
          req.session.userId = user.id;
          return res.redirect('/home');
      }
  }
  return res.redirect('/login');
});

app.post('/register', redirectHome, (req, res) => {
  const {name, email, password} = req.body;

  if (name&&email&&password) {
      const exist = users.some(
          user => user.email === email
      )

      if (!exist) {
          const user = {
              id: users.length + 1,
              name: name,
              email: email,
              password: password,
          };
          users.push(user);
          req.session.userId = user.id;
          return res.redirect('/home')
      }
  }
  return res.redirect('/register'); // if any errors
});

app.post('/logout', redirectLogin, (req, res) => {
  req.session.destroy((err) => {
      if(err) {
          return res.redirect('/home');
      }

      res.clearCookie(process.env.SESS_NAME);
      res.redirect('/login');
  })
});


app.listen(port, console.log(
  `http://test:${port}`
))