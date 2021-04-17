const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const robotSchema = new Schema({
    number:{
        type:String,
        required:true
    },
    roomNumber:{
        type:String,
        required:true,
        unique: true
    },
    position:{
        type:String,
    },
    isOccupied:{
        type:Boolean,
    },
    isObstacle:{
        type : Boolean,
        default: false
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },

});


const Robots = mongoose.model('Robot', robotSchema);

module.exports = Robots;