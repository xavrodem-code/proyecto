const mongoose = require("mongoose");

const fechaSchema = new mongoose.Schema({
    fecha: {
        type: String,
        required: true,
        trim: true        
    },
    usuario: {
        type: mongoose.Types.ObjectId,
        ref: "Usuario",
    }
});

module.exports = mongoose.model("Fecha", fechaSchema);