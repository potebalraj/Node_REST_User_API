var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userModel = new Schema({
    name: { type: String },
    password: { type: String },
    email: {type: String},
    phone: {type: String},
    gender: { type: String },
    avatar: { type: String},
    isEmployee: {type:Boolean, default:false}
});

module.exports = mongoose.model('User1',userModel);