let router = require("express").Router();
let Product = require("../db/product");
let Orders = require("../db/order-db");
let uuidv4 = require("uuid/v4");
let moment = require("moment");
let paystack = require("paystack-api")("sk_test_c2bf95033412e480c0a58cb556420aadb7ce57f5");
router.get("/product/checkout/purchase-product",async function(req,res){
   console.log(req.user);
   let total_ch = 0// this is the initial total amount
   let cart = req.session.cart;
   for(let data in cart){
      total_ch += cart[data].price * cart[data].quantity;
  }
  try{
        let data = await paystack.transaction.initialize({
          email:  req.user.email,
          amount: parseInt(total_ch.toString() + "00")
        });
        console.log(data);
        res.redirect(data.data.authorization_url);
   
  }catch(err){
    console.log(err)
  }
   
});
//testing with paystack callback url
router.get("/product/checkout/paystack",async (req,res)=>{
    try{
         let reference = req.query.reference;
         let data = await paystack.transaction.verify({reference});
              console.log(data);
         if(req.user){
              if(data.data.plan != null){
                    console.log("plan not equall to mull");
              }else{
                      let order;
                      order = new Orders(
                            {user:req.user.id,
                              transaction_id:data.data.reference,
                              quantity:res.locals.cartcounter,
                              cart:req.session.cart,
                              time:moment().format("ll")
                          }
                          );
  
                        await order.save();
                        delete req.session.cart;
                        delete req.session.cartcounter;
                        res.redirect("/");
                }
    }
  }catch(err){
                console.log("error ooo",err)
                res.send(err.error)
    }
})


//end testing with paystack callback url
router.get("/product/checkout-page/clear-cart",function(req,res){
     let cart = req.session.cart;
     for(let data in cart){
       delete cart[data];
     }
     req.session.cart = cart;
     delete req.session.cartcounter;
     res.redirect("/cart/product/checkout-page");
});
router.get("/product/checkout-page/add/:id",function(req,res){
  let cart = req.session.cart;
  if(!cart){
  return res.send("product in the cart is not found");
  }else{
      cart[req.params.id].quantity += 1;
      req.session.cart = cart;
      req.session.cartcounter++;
  res.redirect("/cart/product/checkout-page");
}
});
router.get("/product/checkout-page/sub/:id",function(req,res){
  let cart = req.session.cart;
  if(!cart){
  return res.send("product in the cart is not found");
  }else{
      cart[req.params.id].quantity -= 1;
      if(cart[req.params.id].quantity == 0){
        delete cart[req.params.id];
            }
      req.session.cart = cart;
      req.session.cartcounter--;
  res.redirect("/cart/product/checkout-page");
}
});

router.get("/product/checkout-page",function(req,res){
  let cart = req.session.cart;
  if(!cart){
 // return res.send("you have nothing in your cart");
  }
  
  let cartviewer = {item:[],totalprice:0,totalquantity:0};
  for(let data in cart){
    console.dir(data);
    cartviewer.item.push(cart[data]);
    cartviewer.totalprice += cart[data].price * cart[data].quantity;
    cartviewer.totalquantity += cart[data].quantity;
  }
  res.render("cart-product-checkout",{cartviewer:cartviewer.item,totalprice:cartviewer.totalprice,totalquantity:cartviewer.totalquantity});

})
router.get("/product/:id",async (req,res)=>{
  try{
    let data =  await Product.findById(req.params.id)
       res.render("cart-product-page",{product:data});
  }catch(err){
    res.send("<h1>an error occured at the "+req.url+"route");
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
   res.redirect("/");
  }catch(err){
    res.send("<h1>sorry and error occured</h1>");
  }
  
});
/*router.get("/product/checkout-page",(req,res)=>{
  console.log("product/checkout-page triggered");
   /* let cart = req.session.cart;
    console.dir("/product/checkout-page",cart);
    if(!cart){
    return res.send("you have nothing in your cart");
    }else{
    let cartviewer = {item:[],totalprice:0,totalquantity:0};
    for(let data in cart){
      cartviewer.item.push(data);
      cartviewer.totalprice += data.price * data.quantity;
      cartviewer.totalquantity += data.quantity;
    }
    res.render("/cart-product-checkout",{cartviewer:cartviewer.item,totalprice:cartviewer.totalprice,totalquantity:cartviewer.totalquantity});
  }
  
    });

*/


module.exports = router;