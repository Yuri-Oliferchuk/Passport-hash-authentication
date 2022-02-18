import express from 'express';                              //add express
import passport from 'passport';                            //add pasport
import bcrypt from 'bcrypt';                                //add dcrypt
import {users} from '../db.js'                              //connect file with user object 
const apiRouter = express.Router();

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

//add routers
apiRouter.get('/', (req, res) => {
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
  
apiRouter.get('/home', redirectLogin, (req, res) => {
    res.render('home', {name: req.user.name, email: req.user.username})
});
  
apiRouter.get('/login', redirectHome, function(req, res, next) {
    res.render('login')
})
  
apiRouter.get('/register', redirectHome, (req, res) => {
    res.render('register')
})
  
apiRouter.post('/login', 
          passport.authenticate('local', {failureRedirect: '/login'}), 
          (req, res) => {
            res.redirect('/home');
});
  
apiRouter.post('/register', async (req, res, next) => {
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
  
apiRouter.post('/logout', redirectLogin, (req, res) => {
    req.logout();
    res.redirect('/login');
});

export {apiRouter};