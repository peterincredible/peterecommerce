let router = require("express").Router();
let Product = require("../db/product");
let Packages = require("../db/packages-db");
let cloudinary = require("cloudinary");
let cloudinaryStorage = require("multer-storage-cloudinary");
let multer = require("multer");
let fs = require("fs-extra");
let cat = require("../db/category");
let authenthicate = require("../authenthication");
let User = require("../db/user-db");
let Orders = require("../db/order-db");
//add make the configuration using my cloudinary cloud details
cloudinary.config({
 cloud_name:"dflyjffzr",
 api_key:"879813996966535",
 api_secret:"_LoL49Uy7kWXF823GiYUgZb18co"
});
//initializing my cloudinary details with multer cloudinary storage to upload for us
var storage = cloudinaryStorage({
    cloudinary,
    folder:"ecommerce",
    allowedFormats: ["jpg","png"]
  }); 
  //
  var upload = multer({storage });
//the add-product router on get request
router.get("/add-product",authenthicate("admin"),async (req,res)=>{
    let data= await cat.find({}).select("name -_id").exec();
       res.render("add-product",{title:"add product",categories:data,message:req.flash("success")});
})
//end of the add-product rout on get request
//the post add-product rout 
router.post("/add-product",upload.single("image"),authenthicate("admin"),async (req,res)=>{
  console.log("file in add product",req.file);
  let product = new Product(
    {name:req.body.name,
    category:req.body.category,
    price:req.body.price,
    description:req.body.description,
    image:req.file.url,
    image_id:req.file.public_id
    }
);
/*
*/
try{
    await product.save();
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
      let record=  await Product.findById(req.params.id);//find the record you want to delete from the database
      //use cloudinary to delete the image file from the server
      cloudinary.v2.uploader.destroy(record.image_id,(err)=>{
          if(err){
            throw err;
          }
      })
      //delete the record
      record.remove();
    req.flash("success","product successfully deleted");
    res.redirect("/admin/product");
  }catch(err){
    req.flash("error","there was an error deleting product ");
    res.redirect("/admin/product");
  }
})
//end of the delete-product rout on get request

 //start of the get edit product routh
 router.get("/edit-product/:id",authenthicate("admin"),async (req,res)=>{
  try{
      let product =  await Product.findById(req.params.id).select("name category price description image").exec();
      let categories= await cat.find({}).select("name -_id").exec();
        res.render("edit-product",{title:"edit product",product,categories});
  }catch(e){
     req.flash("error","there was an error visiting the edit page");
     res.redirect("/admin/product");
  }
})
 //#end of the edit product routh
 //start of the post edit product routh
router.post("/edit-product/:id",authenthicate("admin"),async (req,res)=>{
  try{
      let name=req.body.name;
      let category=req.body.category;
      let price= req.body.price;
      let description=req.body.description;
      await Product.findByIdAndUpdate(req.params.id,{name,category,price,description},{new:true});
      req.flash("success","product successfully edited");
      res.redirect("/admin/product");
      }
  catch(err){
      console.log("there was and error in the post edit-product")
      req.flash("error","product cant be edited and error occured");
      res.redirect("/admin/edit-product");
  }    
});
 //#end of the post edit product routh
 //start of the get make user admin route
 router.get("/make-user-admin",authenthicate("admin"),async(req,res)=>{
    res.render("make-user-admin");
 })
 //end of the get make user admin route

 //start work on the edit product image router
router.post("/update-product-image/:id",upload.single("image"),authenthicate("admin"),async (req,res)=>{
  
    try{
      //get the product by it's id from the  product database
        let product = await Product.findById(req.params.id);
      //then put the new image file in the right directory
      if(!product.image_id == "")
      {
       
        //use cloudinary to delete the image file from the server
              cloudinary.v2.uploader.destroy(product.image_id,(e)=>{
                if(e){
                  throw e;
                }
                product.image = req.file.url;//save the new image address
                product.image_id = req.file.public_id;//save the new image public key incase of when product is deleted
                product.save();//save product with new image details
            })
        console.log("updated image")
        req.flash("success","product image successfully updated");
        res.redirect("/admin/product");
      }else{
       product.image = req.file.url;
       product.image_id = req.file.public_id;
       product.save();
        req.flash("success","product image successfully updated");
        res.redirect("/admin/product");
        console.log("updated image")
      }
    //if an error occured the catch block catches it
    }catch(err){
       console.log("an error occured in the update product image");
    }
  });
 //end of the work on the edit product image router

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
//start working on the get categories route
  router.get("/category",authenthicate("admin"),async(req,res)=>{
      let mycat =  await cat.find({})
      res.locals.mycat = mycat;
      res.render("category");
  });
//end of working with the getcategories route

//code for the get add-category route
router.get("/add-category",authenthicate("admin"),async(req,res)=>{
  res.render("add-category");
});

//code block for the end of the get add-category route

//start working witht post add categories route
router.post("/add-category",authenthicate("admin"),async(req,res)=>{
    try{
      console.log(req.body);
        let category = new cat(req.body);
        await category.save();
        res.redirect("/admin/category");
    }catch(err){
      res.send("and error occured in adding category")
    }
});
//end of working with the post add categories route

//start working with the delete category route
router.get("/delete-category/:id",authenthicate("admin"),async(req,res)=>{
 
  try{
       await cat.findByIdAndDelete(req.params.id);

        res.redirect("/admin/category");
     
  }catch(err){
     console.log("and error occured in the delete-category route")
}
});
//end of working witht he delete category route

//start working on the get edit category route
router.get("/edit-category/:id",authenthicate("admin"),async(req,res)=>{
 
  try{
       let category = await cat.findById(req.params.id);

        res.render("edit-category",{category});
     
  }catch(err){
     console.log("and error occured in the delete-category route")
}
});

//end of working on the get edit category route

//start working on the post edit category route
router.post("/edit-category/:id",authenthicate("admin"),async(req,res)=>{
       
  try{
       await cat.findByIdAndUpdate(req.params.id,req.body);
        res.redirect("/admin/category");
     
  }catch(err){
     console.log("and error occured in the delete-category route")
}
});

//end working on the edit category route

//start working on the get Packages page
router.get("/packages",authenthicate("admin"),async(req,res)=>{
     try{
        ///get all packages added here
        let packages = await Packages.find({});
        res.render("packages-page",{packages});
       //include the delete and add packages link  here
     }catch(err){
         console.log("an error occured in the packages route");
     }
  

  
})
//end of the the get packages page

//start working on the get add-package route
router.get("/add-package",authenthicate("admin"),async(req,res)=>{
    res.render("add-packages");
});
//end of the get add-package route

//start working on the post add-package route
router.post("/add-package",authenthicate("admin"),async(req,res)=>{
    try{
         let num = parseInt(req.body.name);
         let data = new Packages({volume:num});
         await data.save();
         req.flash("success","package added successfully");
         res.redirect("/admin/packages");
    }catch(err){
          req.flash("error","an error occured package wasnt added")
          res.redirect("/admin/add-package");
    }
});
//end of the post add-package route

module.exports = router;