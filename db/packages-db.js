let mongoose = require("mongoose");
let schema = mongoose.Schema;
let tempschema = new schema({
   volume:{
       type:Number,
       unique:true
   }
});

let packages = mongoose.model("package",tempschema);
module.exports = packages;