const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    email: {
        type:String,
        required:true,
        trim:true,
    },
    username: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    fechas: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Fecha"
        }
    ]
});

module.exports = mongoose.model("Usuario", usuarioSchema);