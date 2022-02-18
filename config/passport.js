import passport from 'passport';                            //add pasport
import LocalStrategy from 'passport-local';                 //add pasport-local lirary
import bcrypt from 'bcrypt';                                //add dcrypt
import {findByUsername, findById} from '../db.js'            //connect file with user object 

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