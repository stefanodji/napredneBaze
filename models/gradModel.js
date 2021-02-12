const mongoose = require("mongoose");
const { model } = require("./oglasModel");

const gradSchema = new mongoose.Schema({

    naziv: {
        type: String,
        required: true
    },
    koordinate: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    }
    
});

module.exports = mongoose.model("Grad", gradSchema);
