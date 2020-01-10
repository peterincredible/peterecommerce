let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:String
    },
    image_id:{
        type:String
    },
    category:{
        type:String,
        required:true
    }
});

let product = mongoose.model("product",tempschema);
module.exports = product;