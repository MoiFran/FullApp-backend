const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
const rutDocente = require('./routes/rutas-docentes');
const rutCursos = require('./routes/rutas-cursos');
require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use('/api/docente', rutDocente);
app.use('/api/cursos', rutCursos);
app.use((req, res) => {

    res.status(404).json({

        mensaje: 'error'
    })
})
console.log(process.env.PORT);
mongoose.connect(process.env.MONGO_BD).then(() => {
    app.listen(process.env.PORT, () => {
        console.log('listening on http://localhost:5000'); //
    })
}).catch((error) => { console.log(error.message) });