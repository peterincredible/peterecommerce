let router = require("express").Router();
let Product = require("../db/product");
let Orders = require("../db/order-db");
let uuidv4 = require("uuid/v4");
let moment = require("moment");
// get request to get the whole orders a user has made on the plateform
router.get("/orders/:id",async(req,res)=>{
  try{
    let user_orders= await Orders.find({user:req.params.id})
    //let order = await Orders.findById("5d69968ce05c0a62e9be1c4d");
    //first get the list of product in the cart by looping through it and get the name,total quantity,each price of product
    let totalorders = [];
    
    for(let each of user_orders){
      let cartsummery = {totalquantity:0,process:"",trasanction_id:"",_id:"",totalprice:0,time:"",cart:[]};
      cartsummery.totalquantity = each.quantity;
      cartsummery.process = each.process;
      cartsummery.transanction_id = each.transaction_id;
      cartsummery.time = each.time;
      cartsummery._id = each._id
      let keys = Object.keys(each.cart);
        for(let key of keys){
           console.log(Object.keys(each.cart));
            let singlecart = {name:"",quantity:0,price:0,image:"",id:"",totalprice:0}
          cartsummery.totalprice += each.cart[key].quantity * each.cart[key].price;
           singlecart.name = each.cart[key].name;
           singlecart.quantity = each.cart[key].quantity;
           singlecart.price = each.cart[key].price;
           singlecart.totalprice = each.cart[key].price * each.cart[key].quantity;
           singlecart.image = each.cart[key].image;
           singlecart.id = each.cart[key].id;
           cartsummery.cart.push(singlecart)
        }
      totalorders.push(cartsummery);
      
    }
    res.render("orders_page",{totalorders});
  }catch(err){
      res.status("401").send("<h1>we didnt find any orders</h1>");
  }

    
});
//end of the get request of the whole orders a user has made

module.exports = router;