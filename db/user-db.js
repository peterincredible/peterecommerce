let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    }
        
});

let category = mongoose.model("user",tempschema);
module.exports = category;