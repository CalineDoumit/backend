const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const temperatureSchema = new Schema({
    value:{
        type:String,
    }
});


const patientSchema = new Schema({
    description:{
        type: String
    },
    dateofBirth:{
        type: String
    },
    allergies:{
        type: String
    },
    emergencyContact:{
        type: String
    },

    bloodType:{
        type: String
    },
    temperatures:{
        type:Array
    }



});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;