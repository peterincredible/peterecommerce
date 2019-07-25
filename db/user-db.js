let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
let salt = bcrypt.genSaltSync(10);
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
    }
        
});
tempschema.pre("save",function(next){
this.password = bcrypt.hashSync(this.password,salt);
next();
});
tempschema.methods.validPassword = function(password){
 return bcrypt.compareSync(password,this.password);
}

let category = mongoose.model("user",tempschema);
module.exports = category;