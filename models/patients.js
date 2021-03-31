const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const temperatureSchema = new Schema({
    value:{
        type:Number,
        required:true,
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
    temperatures:[temperatureSchema]



});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;