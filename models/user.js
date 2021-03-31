var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema({
    username: {
        type: String
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    phonenumber:{
        type: String
    },
    isActive: {
        type: Boolean
    },
    role: {
        type: String,
        enum: ['admin', 'patient', 'nurse']
    },
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    nurse:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Nurse'
    }

});
User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
