let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
    product:{
        type:String,
        required:true
    }
});

let category = mongoose.model("orders",tempschema);
module.exports = category;