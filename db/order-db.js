let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
    product:{
        type:schema.Types.ObjectId,
        ref:"product"
    },
    user:{
        type:schema.Types.objectid,
        ref:"user"
    },
    quantity:{
        type:Number,
        default:1
    }
});

let category = mongoose.model("orders",tempschema);
module.exports = category;