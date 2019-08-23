let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
    name:{
        type:String,
        required:true
    }
});

let category = mongoose.model("category",tempschema);

module.exports = category;