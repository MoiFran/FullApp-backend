const mongoose = require("mongoose");


const cursoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 70,
        required: true
    },

    horas: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    docente: {
        type: mongoose.Types.ObjectId,
        ref: 'Docente'
    }
});


module.exports = mongoose.model('Curso', cursoSchema);