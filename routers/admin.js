let router = require("express").Router();
let Product = require("../db/product");
let multer = require("multer");
let fs = require("fs-extra");
let cat = require("../db/category");
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
router.get("/add-product",async (req,res)=>{
    let data= await cat.find({}).select("name -_id").exec();
       res.render("add-product",{title:"add product",categories:data,message:req.flash("success")});
     
   
})
//end of the add-product rout on get request
//the post add-product rout 
router.post("/add-product",upload.single("image"),async (req,res)=>{
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
    res.redirect("/admin/add-product");
}catch(e){
  console.log("there was an error");
  req.flash("error","there was and error adding product")
  res.redirect("/admin/add-product");
}

})
//end of the post add-product routh
//the product rout 
router.get("/product",async (req,res)=>{
  try{
    let product = await Product.find({});
    console.log(product);
    if(product.length > 0){
      res.render("product",{product,message:req.flash("success")});
    }else{
      res.render("product");
    }
   
  }catch(e){
      console.log("there was an error");
  }
 
 

})
//end of the product routh
//the delete-product router on get request
router.get("/delete-product/:id",async (req,res)=>{
  try{
    await Product.findByIdAndRemove(req.params.id)
    req.flash("success","product successfully deleted");
    res.redirect("/admin/product");
  }catch(e){
    req.flash("success","there was an error deleting product ");
    res.redirect("/admin/product");
  }
})
//end of the delete-product rout on get request
//the post delete-product rout 
router.post("/add-product",upload.single("image"),async (req,res)=>{
let product = new Product(
  {name:req.body.name,
  category:req.body.category,
  price:req.body.price,
  description:req.body.description,
  image:req.file.originalname
  }
);

try{
  let data = await product.save();
  console.log(data);
  await fs.move("upload/"+req.file.originalname,"public/images/"+data._id+"/"+data.image);
  req.flash("success","product has been successfully added");
  res.redirect("/admin/add-product");
}catch(e){
console.log("there was an error");
req.flash("error","there was and error adding product")
res.redirect("/admin/add-product");
}

})
//end of the post delete-product routh
//delete product route
 router.get("/delete-product/:id",async (req,res)=>{
     try{
          await Product.findByIdAndRemove(req.params.id)
           req.flash("success","data has been successfully deleted");
           res.redirect("/admin/product");
     }catch(e){
        req.flash("error","there was an error deleting the product");
        res.redirect("/admin/product");
     }
 })
 //start of the edit product routh
 router.get("/edit-product/:id",async (req,res)=>{
  try{
      let data =  await Product.findById(req.params.id)
        res.render("edit-product",{title:"edit product",product:data});
  }catch(e){
     req.flash("error","there was an error editing  the product");
     res.redirect("/admin/product");
  }
})
 //#end of the edit product routh
module.exports = router;