const mongoose = require("mongoose");


const docenteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        minLength: 3,
        maxLength: 70,
        required: true
    },
    email: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true
    },
    password: {
        type: String,
        required: true,

    },
    cursos: [{
        type: mongoose.Types.ObjectId,
        ref: 'Curso'
    }]
});


module.exports = mongoose.model('Docente', docenteSchema);