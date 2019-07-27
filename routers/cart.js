let router = require("express").Router();
let Product = require("../db/product");

router.get("/product/:id",async (req,res)=>{
  try{
    let data =  await Product.findById(req.params.id)
       res.render("cart-product-page",{product:data});
  }catch(err){
    res.send(err);
  }
});
router.get("/product/add-to-cart/:id", async(req,res)=>{
  try{
    let data = await Product.findById(req.params.id).select("name price image").exec();
  let cart = req.session.cart || {};
   if(!cart[req.params.id]){
     cart[req.params.id] ={quantity:0,name:data.name,price:data.price,image:data.image,_id:req.params.id};
   }
   cart[req.params.id].quantity++;
   req.session.cart = cart;
   req.session.cartcounter = (req.session.cartcounter)? req.session.cartcounter + 1 : 1;
   console.log("req.user.cartcounter is "+ req.session.cartcounter);
   res.redirect("/");
  }catch(err){
    res.send("<h1>sorry and error occured</h1>");
  }
  
})
router.get("/product/checkout",async (req,res)=>{
    cart = req.session.cart;
    if(!cart){
    return res.send("you have nothing in your cart");
    }
    let cartviewer = {item:[],totalprice:0,totalquantity:0};
    for(let data in cart){
      cartviewer.item.push(data);
      cartviewer.totalprice += data.price * data.quantity;
      cartviewer.totalquantity += data.quantity;
    }
    res.render("/cart-product-checkout"/*,{cartviewer:cartviewer.item,totalprice:cartviewer.totalprice,totalquantity:cartviewer.totalquantity}*/);
});

module.exports = router;