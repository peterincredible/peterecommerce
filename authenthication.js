function authenthication(role){
  return function(req,res,next){
        if(req.isAuthenticated()){
            if(req.user.role =="admin" || req.user.role == role){
                 next();
            }else{
                console.log("user role is",req.user);
                console.log("user role is",req.session.passport.user);
                res.send("<h1> user is not authorized to view this page </h1>");
            }
        }else{
            res.redirect("/user/signin");
        }

  }
}
module.exports = authenthication;