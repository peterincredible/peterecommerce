let router = require("express").Router();
let Product = require("../db/product");
let User = require("../db/user-db");
let bcrypt = require("bcryptjs");
let salt = bcrypt.genSaltSync(10);
let Packages = require("../db/packages-db");
let Orders = require("../db/order-db");
let passport = require("../mypassport");
let authenthicate = require("../authenthication");
var csrf = require('csurf');
let paystack = require("paystack-api")("sk_test_c2bf95033412e480c0a58cb556420aadb7ce57f5");
let moment = require("moment");
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
  console.log(user.password);
  user.password = bcrypt.hashSync(user.password,salt);
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
  res.render("login-page",{csrfToken: req.csrfToken()});
})
//end of the get signin page
//start of the post signin-page
router.post("/signin",passport.authenticate("local"),(req,res)=>{
   res.redirect("/");
});
//end of the post signin-page
//start of the get signout route
router.get("/signout",(req,res)=>{
  req.logout();
  delete req.session.cartcounter;
  delete req.session.cart;
  console.log("user has been successfully logout");
  res.redirect("/");
})
//end of the get signut route
//workin on the user dashboard
router.get("/dashboard",authenthicate("user"),async(req,res)=>{
   try{
      let packages = await Packages.find({});
      if(req.user.role == "admin"){
        res.locals.admin = "admin";
      }
      let data = await Orders.find({user:req.user._id});
      let order_finished = data.filter((order)=>{
        return order.process =="finished";
  }).length
      let order_cancelled = data.filter((order)=>{
        return order.process =="cancelled";
  }).length
      let order_inprogress = data.filter((order)=>{
            return order.process =="in progress";
      }).length
    res.render("dashboard",{user:req.user,order_inprogress,order_cancelled,order_finished,packages});
   }catch(err){
     res.send("<h1>there was an error in the dashboard /dashboard</h1>");
   }
    
})
//end of the dashboard route

//start of the get change password route
router.get("/change-password",authenthicate("user"),async(req,res)=>{
    res.render("change-password");
});

//end of the get chane password route

//start of the post change password route
router.post("/change-password",authenthicate("user"),async(req,res)=>{
  try{
//confirm if the user is really who he or she says they are by confirming if the current passwrd is
// the same with the one on the database

  let dbuser = await User.findById(req.user._id);
    if(!dbuser.validPassword(req.body.prevpwd)){
       // return res.send("you an an impersonator")
    }
    //compare the new password hash with the old passwrd
    if(!dbuser.validPassword(req.body.newpwd)) {
      //if they are not the same password you save passwrd as the new passwrod and send a res that password change successfull
      dbuser.password = req.body.newpwd;
      await dbuser.save();
     // return res.redirect("/user/dashboard");
    }
  //if they are the same you send a res to the user that u cant put the new passwrd as same as old password
   return res.send("new password is the same as old password cant be accept change password")
  }catch(err){
      res.send("just hold on something is wrong with the database");
  }

})
//end of the post change password route
//start of the get delete Account route
router.get("/delete-account/:id",authenthicate("user"),async(req,res)=>{
    //get the user from the database based on the id and delete it 
    try{
    //redirect the page back to the home page
      await User.findByIdAndDelete(req.params.id)
      console.log("delete account triggered dddddddd");
      res.redirect("/");
    }catch(error){
     //if there is an error send it back
     res.send("an error occured in the delete account ");
    }

    
});
//end of the get delete account route

//start of the get edit profile account
router.get("/edit-profile/:id",authenthicate("user"),async(req,res)=>{
  try{
    let data = await User.findById(req.params.id);
      res.render("edit-profile",{user:data});
  }catch(err){
      res.send("an error occured cant view edit-profile page check the database if there was an error")
  }
});
//end of the get edit profile account

//start of the post edit profile account
router.post("/edit-profile/:id",authenthicate("user"),async(req,res)=>{
   try{
        await User.findByIdAndUpdate(req.params.id,req.body).exec();
  
        res.redirect("/user/dashboard");
   }catch(err){
  
          res.send("an error occured in the edit profile route");
   }
});
//end of the post edit profile account

//start working on the get user package investment page
router.get("/package-investment/:id",authenthicate("user"),async (req,res)=>{
  
  
  try{
        let package = await Packages.findById(req.params.id);
        console.log(package);
        let data = await paystack.transaction.initialize({
          email:  req.user.email,
          amount:7000,
          plan:"PLN_6vub51sv3eezfst",
          invoice_limit:1
        });
        console.log(data,"paystack data");
        res.redirect(data.data.authorization_url);

  }catch(err){
    res.status(401).send("<h1>we dont have this package investment volume</h1>")
  }
})
//end of the get user package investment page

//start working on the post user package investement route
router.post("/package-investment/:id",authenthicate("user"),async (req,res)=>{
       try{

       }catch(err){
         console.log("there was an error")
       }
  
 /* try{
    let package = await Packages.findById(req.params.id);
    let user = await User.findById(req.user.id);
    user.investment.push({volume:package.volume,time:moment().format("ll")});
    await user.save();
    res.redirect("/user/dashboard");

  }catch(err){
    res.status(401).send("<h1>we have a problem on the package investment post route</h1>");
  }*/
})
//end of the post user package investment route

//start of the get investment page route
router.get("/investment-page",authenthicate("user"),async(req,res)=>{
     try{
          let user = await User.findById(req.user.id);
          let yourinvestment = user.investment;
          res.render("investment-page",{yourinvestment});
     }catch(err){
       console.log('<h1>there is an error in the investment-page route </h1>');
     }
});
//end of the get investment page route

module.exports = router;
