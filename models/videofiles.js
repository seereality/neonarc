

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');


module.exports = mongoose.model("fs.files",{userId:String});
