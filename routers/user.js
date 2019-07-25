let router = require("express").Router();
let Product = require("../db/product");
let User = require("../db/user-db");
let passport = require("../mypassport");
let authenthicate = require("../authenthication");
var csrf = require('csurf');
var csrfProtection = csrf({ cookie: true });
//isauthenthicated to check if a user is authenthicated
  function authenthication(req,res,next){
      if(req.isAuthenticated()){
        next();
      }else{
       return res.send("<h1>not authorized to view this page</h1>")
      }
  }
//end of the isauthenthication function;
//working on the registration page
router.get("/registration",(req,res)=>{
    res.render("registration-page");
})
//end of the get registration page
//start of the post registration page
router.post("/registration",(req,res)=>{
  let user = new User(req.body);
  user.save()
  .then(data=>{
    req.login(user,function(err){
      if(err){
        console.log('there was an error login a new user in');
      }
      else{
          console.log('passport login worked just the way it should work'+ req.isAuthenticated());

        res.redirect("/");
      }
    })
  }).catch(err=>{
    res.send("<h1>a serious registration error occured</h1>");
  })
});
//start of the get signin page
router.get("/signin",csrfProtection,(req,res)=>{
  res.render("login-page",{csrfToken: req.csrfToken() });
})
//end of the get signin page
//start of the post signin-page
router.post("/signin",passport.authenticate("local"),(req,res)=>{
  console.log("it worked first");
   res.redirect("/");
});
//end of the post signin-page
//start of the get signout route
router.get("/signout",(req,res)=>{
  req.logout();
  delete req.session.cartcounter;
  console.log("user has been successfully logout");
  res.redirect("/");
})
//end of the get signut route
//workin on the user dashboard
router.get("/dashboard",authenthicate("user"),(req,res)=>{
     res.render("dashboard");
})
//end of the dashboard route
module.exports = router;
