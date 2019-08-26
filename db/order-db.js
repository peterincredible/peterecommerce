let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
   
    user:{
        type:schema.Types.ObjectId,
        ref:"user"
    },
    quantity:{
        type:Number,
        default:1
    },
    transaction_id:{
        type:String
    },
    cart:{
        type:Object
    },
    process:{
        type:String,
        default:"in progress"
    },
    time:{
        type:String,
        required:true
    }
});

let orders = mongoose.model("orders",tempschema);
module.exports = orders;