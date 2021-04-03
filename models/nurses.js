const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nurseSchema = new Schema({
    description:{
        type: String
    }
});

const Nurse = mongoose.model('Nurse', nurseSchema);

module.exports = Nurse;