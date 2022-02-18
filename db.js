export const users = [
    {id:1, name:'Alex', username:'alex@gmail.com', password:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO9/xWd7/OzPj1V2GzsI4mz5J.7wPua3e', salt:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO'},
    {id:2, name:'Yura', username:'yura@gmail.com', password:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO9/xWd7/OzPj1V2GzsI4mz5J.7wPua3e', salt:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO'},
    {id:3, name:'Admin', username:'admin@gmail.com', password:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO9/xWd7/OzPj1V2GzsI4mz5J.7wPua3e', salt:'$2b$10$Yr2SlyMCwuhrwivZY0EPhO'}
  ]

export const findById = function (id, cb) {
    process.nextTick(function () {
      var idx = id - 1;
      if (users[idx]) {
        cb(null, users[idx]);
      } else {
        cb(new Error("User " + id + " does not exist"));
      }
    });
  };
  
export const findByUsername = function (username, cb) {
    process.nextTick(function () {
      for (let i = 0, len = users.length; i < len; i++) {
        let user = users[i];
        if (user.username === username) {
          return cb(null, user);
        }
      }
      return cb(null, null);
    });
  };
  
