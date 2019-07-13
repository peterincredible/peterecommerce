let router = require("express").Router();
let Product = require("../db/product");
//working on the registration page
router.get("/registration",(req,res)=>{
    res.render("registration-page");
})
//end of the get registration page
//start of the post registration page
router.post("/registration",(req,res)=>{
  res.send("<h1>it worked yaaaahhh</h1>");
});
//start of the get login page
router.get("/login",(req,res)=>{
  res.render("login-page");
})
//end of the get login page
//start of the post login-page
router.post("/login",(req,res)=>{
  res.send("<h1>it worked yaaaahhh</h1>");
});
//end of the post login-page
module.exports = router;
