let express = require("express");
let exphbs = require("express-handlebars");
let Product = require("./db/product");
let hbs = exphbs.create({extname:".hbs",defaultLayout:"main",helpers:{
    compare:function(val1,val2,options){
        if(val1 == val2){
            
            return  options.fn(this);
        }else{
           
            return options.inverse(this);
        }
    }
}});
let app = express();
//setting up the view engine
app.engine(".hbs",hbs.engine);
app.set("view engine",".hbs");
//#end of setting up the view engine
//set up various middlewares
let bodyparser = require("body-parser");
let cookie = require("cookie-parser");
let session = require("express-session");
let flash = require("connect-flash");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
app.use(cookie());
app.use(session({secret:"beans",
saveUninitialized:true,
resave:true
}));
app.use(flash());
//#end of setting up various middlewares
//setting up the mongoose database
 let mongoose = require("mongoose");
 mongoose.connect("mongodb://localhost/peterecommerce");
 mongoose.connection.once("open",()=>{
     console.log("successfully connected to the database");
 });
 mongoose.connection.on("close",()=>{
     console.log("connection was closed");
 })
//#ending of setting up the mongoose database

let port = process.env.port || 3000;
app.use(express.static(`public`));
app.use("/admin",express.static("public"));
app.use("/admin/add-product",express.static("public"));
app.use("/admin/product",express.static("public"));
app.use("/admin/edit-product",express.static("public"));
app.use(function(req,res,next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})
app.get("/",async (req,res)=>{
    try{
        res.render("home",{title:"home",product:await Product.find({})}); 
    }catch(err){
        res.send("<h1 class='text-center'>an error occured</h1>");
    }
    
});
//the search product route
app.get("/search/product",async (req,res)=>{
  try{
    let product = await Product.find({category:req.query.search}).exec();
    console.log("the params value is"+req.params.search);
    console.log(product);
    res.render("home",{title:"home",product});
  }catch(err){
    console.log("an error occured");
  }
})
//getting the various routers
let adminrouter = require("./routers/admin");
app.use("/admin",adminrouter);
//#end of getting the various routers
app.listen(port,()=>{
    console.log("server is listening to port 3000"+__dirname);
})