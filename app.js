let express = require("express");
let exphbs = require("express-handlebars");
let hbs = exphbs.create({extname:".hbs",defaultLayout:"main",helpers:{
    compare:function(val1,val2,options){
        if(val1 == val2){
            console.log("val1 is"+val1);
            console.log("val2 is"+val2);
            return  options.fn(this);
        }else{
            console.log("val1 is"+val1);
            console.log("val2 is"+val2);
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
app.get("/",(req,res)=>{
    res.render("home",{title:"home"});
});
//getting the various routers
let adminrouter = require("./routers/admin");
app.use("/admin",adminrouter);
//#end of getting the various routers
app.listen(port,()=>{
    console.log("server is listening to port 3000"+__dirname);
})