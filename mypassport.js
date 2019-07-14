let User = require("./db/user-db");
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
passport.use(new LocalStrategy(function(username,password,done){
User.findOne({username:username},function(err,user){
if(err){return done(err)}
if(!user){
    return done(null,false,{message:"incorrect Username"})
}
if(!user.validPassword(password)){
     return done(null,false,{message:"Incorrect password"})
}
return done(null,user);
})
}));
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
module.exports = passport;