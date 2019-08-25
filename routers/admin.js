let router = require("express").Router();
let Product = require("../db/product");
let multer = require("multer");
let fs = require("fs-extra");
let cat = require("../db/category");
let authenthicate = require("../authenthication");
let User = require("../db/user-db");
let Orders = require("../db/order-db");
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })
   
  var upload = multer({ storage: storage })
//the add-product router on get request
router.get("/add-product",authenthicate("admin"),async (req,res)=>{
    let data= await cat.find({}).select("name -_id").exec();
       res.render("add-product",{title:"add product",categories:data,message:req.flash("success")});
})
//end of the add-product rout on get request
//the post add-product rout 
router.post("/add-product",upload.single("image"),authenthicate("admin"),async (req,res)=>{
  let product = new Product(
    {name:req.body.name,
    category:req.body.category,
    price:req.body.price,
    description:req.body.description,
    image:req.file.originalname
    }
);
/*
*/
try{
    let data = await product.save();
    console.log(data);
    await fs.move("upload/"+req.file.originalname,"public/images/"+data._id+"/"+data.image);
    req.flash("success","product has been successfully added");
    res.redirect("/admin/product");
}catch(e){
  console.log("there was an error");
  req.flash("error","there was and error adding product")
  res.redirect("/admin/product");
}

})
//end of the post add-product routh
//the product rout 
router.get("/product",authenthicate("admin"),async (req,res)=>{
  try{
    let product = await Product.find({});
    console.log(product);
    if(product.length > 0){
     return res.render("product",{product});
    }else{
      return res.render("product");
    }
  }catch(e){
      console.log("there was an error");
  }
})
//end of the product routh
//the delete-product router on get request
router.get("/delete-product/:id",authenthicate("admin"),async (req,res)=>{
  try{
    await Product.findByIdAndRemove(req.params.id);//find and remove the product from the mongodb database
    await fs.remove("public/images/"+req.params.id)//find and remove the just deleted product product image from the server
    await Orders.findOne({})
    req.flash("success","product successfully deleted");
    res.redirect("/admin/product");
  }catch(e){
    req.flash("error","there was an error deleting product ");
    res.redirect("/admin/product");
  }
})
//end of the delete-product rout on get request

 //start of the get edit product routh
 router.get("/edit-product/:id",authenthicate("admin"),async (req,res)=>{
  try{
      let product =  await Product.findById(req.params.id);
      let categories= await cat.find({}).select("name -_id").exec();
        res.render("edit-product",{title:"edit product",product,categories});
  }catch(e){
     req.flash("error","there was an error visiting the edit page");
     res.redirect("/admin/product");
  }
})
 //#end of the edit product routh
 //start of the post edit product routh
router.post("/edit-product/:id",upload.single("image"),authenthicate("admin"),async (req,res)=>{
  try{
      let name=req.body.name;
      let category=req.body.category;
      let price= req.body.price;
      let description=req.body.description;
      let image=req.file.originalname;
      //await fs.move("upload/"+req.file.originalname,"public/images/"+data._id+"/"+data.image);
      let data = await Product.findById(req.params.id).select("image").exec();
      if(data.image == ""){
        let product = await Product.findByIdAndUpdate(req.params.id,{name,category,price,description,image},{new:true});
        await fs.move("upload/"+req.file.originalname,"public/images/"+product._id+"/"+product.image);
        req.flash("success","product successfully edited");
        res.redirect("/admin/product");
      }else if(fs.pathExistsSync("public/images/"+data._id+"/"+data.image)){
          await fs.remove("public/images/"+data._id+"/"+data.image);
          let product = await Product.findByIdAndUpdate(req.params.id,{name,category,price,description,image},{new:true});
          await fs.move("upload/"+req.file.originalname,"public/images/"+product._id+"/"+product.image);
          req.flash("success","product successfully edited");
          res.redirect("/admin/product");
      }else{
        let product = await Product.findByIdAndUpdate(req.params.id,{name,category,price,description,image},{new:true});
        await fs.move("upload/"+req.file.originalname,"public/images/"+product._id+"/"+product.image);
        req.flash("success","product successfully edited");
        res.redirect("/admin/product");
      }
  }catch(err){
      console.log("there was and error in the post edit-product")
      req.flash("error","product cant be edited and error occured");
      res.redirect("/admin/edit-product");
  }  
  /*try{
    let name = req.body.name;
    let category = req.body.category;
    let price = req.body.price;
    let description = req.body.description;
    let image = req.file.originalname;
    //let oldimage = await Product.findById(req.params.id).select("image -_id").exec();
    //console.log(oldimage)
    console.log(image+"this is the new image");

  }catch(err){
    console.log("an error occured");
  }*/   
});
 //#end of the post edit product routh
 //start of the get make user admin route
 router.get("/make-user-admin",authenthicate("admin"),async(req,res)=>{
    res.render("make-user-admin");
 })
 //end of the get make user admin route
 //start of thepost  make user admin route
 router.post("/make-user-admin",authenthicate("admin"),async(req,res)=>{
    try{
       // let data = await User.findOneAndUpdate({name:req.body.name},{role:"admin"});
       let data = await User.findOne({username:req.body.username});
        console.log(data);
     
        res.send(data);

    }catch(err){
      res.send("an error was found in "+req.url);
    }
 });
 //end of the make user admin route
 //start of making make-user-admin add user post route
 router.post("/make-user-admin/add-user",authenthicate("admin"),async(req,res)=>{
    try{
      let data = await User.findOneAndUpdate({username:req.body.username},{role:"admin"},{new:true});
        console.log(data);
        res.send("user successfully made an admin");
    }catch(err){
      res.send("could not make user admin")
    }
  
 })
 //end of making make-user-admin add user post route
 //the start of the delete user router
 router.get("/delete-user",authenthicate('admin'),async (req,res)=>{
           res.render("delete-user");
 });
 //the end of the get delete user router
 //the start of the post delete user router
 router.post("/delete-user",authenthicate('admin'),async (req,res)=>{
  try{
    let data = await User.findOne({username:req.body.username});
     console.log(data);
  
     res.send(data);

 }catch(err){
   res.send("an error was found in "+req.url);
 }
})
//the end of the post delete user router
//the start of the post delete-user/delete
router.post("/delete-user/delete",authenthicate("admin"),async(req,res)=>{
  try{
    let data = await User.findOneAndRemove({username:req.body.username});
    
    await Orders.deleteMany({user:data._id}).exec();
      res.send("user successfully deleted");
  }catch(err){
    res.send("could not delete user")
  }

})
//the end of the post delete-user/delete
//start working on the get add categories route
  router.get("/category",authenthicate("admin"),async(req,res)=>{
      res.render("category");
  });
//end of working with the get add categories route

//start working witht post add categories route
router.post("/add-category",authenthicate("admin"),async(req,res)=>{
    try{
      console.log(req.body);
        let category = new cat(req.body);
        await category.save();
        res.send("category successfully saved");
    }catch(err){
      res.send("and error occured in adding category")
    }
});
//end of working with the post add categories route

module.exports = router;