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
    category:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    }
});

let product = mongoose.model("product",tempschema);
module.exports = product;