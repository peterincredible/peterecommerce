let express = require("express");
let exphbs = require("express-handlebars");
let Product = require("./db/product");
let Category = require("./db/category");
let passport = require("./mypassport");
let app = express();
let mongoose = require("mongoose");
if(process.env.PORT){
    mongoose.connect("mongodb://peterincredible:omolola3@ds139979.mlab.com:39979/heroku_z4d509bt")

  }else{
         mongoose.connect("mongodb://localhost/peterecommerce");
  }
 
 mongoose.connection.once("open",()=>{
     console.log("successfully connected to the database");
 });
 mongoose.connection.on("close",()=>{
     console.log("connection was closed");
 })
 mongoose.Promise = global.Promise;
//set up various middlewares
let bodyparser = require("body-parser");
let cookie = require("cookie-parser");
let session = require("express-session");
let mongostore = require("connect-mongo")(session);
let flash = require("connect-flash");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}));
let secret ={secret:"beans",
saveUninitialized:true,
resave:true,
store:new mongostore({mongooseConnection:mongoose.connection}),
}
app.use(cookie());
app.use(session(secret));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//#end of setting up various middlewares
let hbs = exphbs.create({extname:".hbs",defaultLayout:"main",helpers:{
    compare:function(val1,val2,options){
        if(val1 == val2){
            
            return  options.fn(this);
        }else{
           
            return options.inverse(this);
        }
    },
    add:function(val1,val2){
        return val1 *  val2;
    },
    trunc:function(str){
         return (str.length > 40)? str.substring(0,32) + "...": str;
    },
    cancel_orders:function(str,_id){
    
        return (str == "cancelled")? "": `<a href='/user/orders/cancel_order/${_id}' style='display:inline-block;' class=' btn btn-danger'>cancel</a>`;
    }
}});


  
//#ending of setting up the mongoose database
//setting up the view engine
app.engine(".hbs",hbs.engine);
app.set("view engine",".hbs");
//#end of setting up the view engine

//setting up the mongoose database
 

let port = process.env.PORT || 5000;
app.use(express.static(`public`));
app.use("/admin",express.static("public"));
app.use("/admin/add-product",express.static("public"));
app.use("/admin/product",express.static("public"));
app.use("/admin/edit-product",express.static("public"));
app.use(function(req,res,next){
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.user;
   // res.locals.mycat = req.session.mycat;
    res.locals.cartcounter = req.session.cartcounter;
    
    next();
})
app.get("/",async (req,res)=>{
    try{
        let category = await Category.find({})//get all the categories of product
        let product = await Product.find({})//get all the product in  the database
        res.render("home",{title:"home",product,category}); 
    }catch(err){
        res.send("<h1 class='text-center'>an error occured</h1>");
    }
    
});
//the search product route
app.get("/search/product",async (req,res)=>{
  try{
    let category = await Category.find({})//get all the categories of product
    let product = await Product.find({category:req.query.search}).exec();//get all product name that match the search query
    res.render("home",{title:"home",product,category});
  }catch(err){
    console.log("an error occured");
  }
})
//getting the various routers
let adminrouter = require("./routers/admin");
let cartrouter = require("./routers/cart");
let orderrouter = require("./routers/order");
let user = require("./routers/user");
app.use("/admin",adminrouter);
app.use("/user",user);
app.use("/cart",cartrouter);
app.use("/user",orderrouter);

//#end of getting the various routers
app.listen(port,()=>{
    console.log("server is listening to port 3000"+__dirname);
})