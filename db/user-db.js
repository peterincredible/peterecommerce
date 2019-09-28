let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
let schema = mongoose.Schema;
let investments = new schema({
    volume:Number,
    time:String
});
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
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    surname:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"user"
    },
    investment:[investments]
        
});
tempschema.methods.validPassword = function(password){
 return bcrypt.compareSync(password,this.password);
}
let category = mongoose.model("user",tempschema);
module.exports = category;