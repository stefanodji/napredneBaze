const mongoose = require("mongoose");
const { model } = require("./oglasModel");

const deloviGradaSchema = new mongoose.Schema({

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
    },
    gradId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Grad"
    },
    
});

module.exports = mongoose.model("DeloviGrada", deloviGradaSchema);
