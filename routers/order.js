let router = require("express").Router();
let Product = require("../db/product");
let Orders = require("../db/order-db");
let uuidv4 = require("uuid/v4");
let moment = require("moment");
let authenthicate = require("../authenthication");
//this findingOrders do the searching of orders based on the process of orders which can be cancelled,finished,in process
async function findingOrders (searchstring,req){
  let user_orders;
  if(searchstring == "all"){
     user_orders= await Orders.find({user:req.user.id})
  }else{
    user_orders= await Orders.find({user:req.user.id,process:searchstring});
  }
  
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
          let singlecart = {name:"",quantity:0,price:0,image:"",id:"",totalprice:0}
        cartsummery.totalprice += each.cart[key].quantity * each.cart[key].price;
         singlecart.name = each.cart[key].name;
         singlecart.quantity = each.cart[key].quantity;
         singlecart.price = each.cart[key].price;
         singlecart.totalprice = each.cart[key].price * each.cart[key].quantity;
         singlecart.image = each.cart[key].image;
         singlecart.id = each.cart[key]._id;
         cartsummery.cart.push(singlecart)
      }
    totalorders.push(cartsummery);
  }
  return totalorders;
}
//end of the findingOrders function

//start working on the get pending order router
router.get("/orders/pending_orders",authenthicate("user"),async (req,res)=>{
  try{
    let totalorders = await findingOrders("in progress",req);
    res.render("pending_orders_page",{totalorders});
  }catch(err){
      res.status("401").send("<h1>we didnt find any pending orders</h1>");
  }

  
})
//end of working on the get pending order router

//get request to get all the cancelled orders
router.get("/orders/cancelled_orders",authenthicate("user"),async (req,res)=>{
  try{
    let totalorders = await findingOrders("cancelled",req);
    res.render("cancelled_orders_page",{totalorders});
  }catch(err){
      res.status("401").send("<h1>we didnt find any cancelled orders</h1>");
  }
  
})
//end of the get request to get all the cancelled orders

//start of the get finished orders route
router.get("/orders/finished_orders",authenthicate("user"),async (req,res)=>{
  try{
    let totalorders = await findingOrders("finished",req);
    res.render("finished_orders_page",{totalorders});
  }catch(err){
      res.status("401").send("<h1>we didnt find any finished orders</h1>");
  }
})
//end of the get finished route


//working  on the cancel order button
router.get("/orders/cancel_order/:id",authenthicate("user"),async(req,res)=>{
     try{
          let data = await Orders.findByIdAndUpdate(req.params.id,{process:"cancelled"});
          res.redirect("/user/orders");
          
     }catch(err){
         console.log("error in the cancel orders button route");
     }
 
})
//end of the cancel order button

// get request to get the whole orders a user has made on the plateform
router.get("/orders",authenthicate("user"),async(req,res)=>{
  try{
     let totalorders = await findingOrders("all",req);
    res.render("orders_page",{totalorders});
  }catch(err){
      res.status("401").send("<h1>we didnt find any orders</h1>");
  }  
});
//end of the get request of the whole orders a user has made
module.exports = router;