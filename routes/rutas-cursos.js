// rutas-cursos.js

const express = require("express");
const router = express.Router();
const Curso = require("../models/model-cursos");
const Docente = require("../models/model-docente");

const checkAuth = require("../middleware/cheack-auth");
const { log } = require("console");

// * Recuperar todos los cursos desde la BDD en Atlas
router.get("/", async (req, res, next) => {
  let cursos;
  try {
    cursos = await Curso.find({}).populate("docente");
  } catch (error) {
    const err = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    mensaje: "Todos los cursos",
    cursos: cursos,
  });
});

// * Recuperar cursos por id
// router.get("/:id", async (req, res, next) => {
//   const idCurso = req.params.id;
//   let curso;
//   try {
//     curso = await Curso.findById(idCurso);
//   } catch (error) {
//     const err = new Error("Ha ocurrido un error en la recuperación de datos");
//     error.code = 500;
//     return next(err);
//   }
//   res.status(200).json({
//     mensaje: "Curso recibido",
//     curso: curso,
//   });
// });

// router.get("/buscar/:busca", async (req, res, next) => {
//   const search = req.params.busca;
//   let curso;
//   try {
//     curso = await Curso.find({
//       nombre: { $regex: search, $options: "i" },
//     }).populate("docente");
//   } catch (error) {
//     const err = new Error("No se han encontrado los datos solicitados.🔙");
//     err.code = 500;
//     return next(err);
//   }
//   res.status(200).json({ mensaje: "Docentes encontrados", curso: curso });
// });
//Buscar por parametro
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let cursos;
  try {
    cursos = await Curso.find({
      nombre: { $regex: search, $options: "i" },
      //regex: nos indica que busquemos en el valor asignado a search y options es para ignorar may o min;
    }).populate("docente");
  } catch (error) {
    const err = new Error("No se han encontrado los datos solicitados.");
    err.code = 500;
    return next(err);
  }
  res.status(200).json({ mensaje: "Cursos encontrados", cursos: cursos });
});

//router.use(checkAuth);

// * Crear un nuevo curso
router.post("/", async (req, res, next) => {
  const { nombre, horas, precio, docente } = req.body;
  let docenteBusca;
  try {
    docenteBusca = await Docente.findById(docente).populate("cursos");
  } catch (err) {
    return res.status(500).json({
      mensaje: "Ha fallado la operación",
      error: err.message,
    });
  }
  // ? Si el docente no está en la base de datos
  if (!docenteBusca) {
    const error = new Error(
      "No se ha podido encontrar el docente con la id proporcionada"
    );
    error.code = 404;
    return next(error);
  }
  // ? Si el docente está en la base de datos
  const nuevoCurso = new Curso({ nombre, horas, precio, docente });
  try {
    await nuevoCurso.save(); // ? (1) Crear docente  y guardar
    docenteBusca.cursos.push(nuevoCurso); // ? (2) Guardar nuevo curso en el array de cursos del docente.
    await docenteBusca.save(); // ? (3) Guardar docente con array de cursos actualizado
  } catch (error) {
    const err = new Error(
      "Ha fallado la operación de creación del nuevo curso"
    );
    err.code = 404;
    return next(error);
  }
  res.status(201).json({
    mensaje: "Curso añadido a la BDD",
    curso: nuevoCurso,
  });
});

// * Modificar curso en base a su id - Método alternativo
router.patch("/:id", async (req, res, next) => {
  const { nombre, horas, precio, docente } = req.body;
  console.log(req.body);
  console.log("hola");
  const idCurso = req.params.id;
  let cursoBuscar;

  try {
    cursoBuscar = await Curso.findById(idCurso).populate("docente");
    if (docente) {
      cursoBuscar.docente.cursos.pull(cursoBuscar);
      await cursoBuscar.docente.save();
      docenteBuscar = await Docente.findById(docente).populate("cursos");
      docenteBuscar.cursos.push(cursoBuscar);
      docenteBuscar.save();
    }
    cursoBuscar = await Curso.findByIdAndUpdate(
      idCurso,
      { nombre, horas, precio, docente },
      { new: true }
    );
  } catch (error) {
    console.log(error.message);
    const err = new Error(
      "Ha ocurrido un error. No se han podido actualizar los datos"
    );
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    mensaje: "Curso modificado",
    curso: cursoBuscar,
  });
});

// * Eliminar un curso de la BDD por su id (con referencias)
router.delete("/:id", async (req, res, next) => {
  idEliminar = req.params.id;
  let cursoEliminar;
  try {
    cursoEliminar = await Curso.findById(idEliminar).populate("docente");
  } catch (error) {
    const err = new Error(
      "Ha ocurrido un error. No se ha podido realizar la operación"
    );
    error.code = 500;
    return next(err);
  }
  if (!cursoEliminar) {
    const error = new Error(
      "No se ha podido encontrar un curso con el id especificado"
    );
    error.code = 404;
    return next(error);
  }
  try {
    await cursoEliminar.remove();
    cursoEliminar.docente.cursos.pull(cursoEliminar);
    await cursoEliminar.docente.save();
  } catch (error) {
    const err = new Error(
      "Ha ocurrido un error. No se ha podido eliminar el curso"
    );
    console.log(error.message);
    error.code = 500;
    return next(err);
  }
  res.json({
    mensaje: "Curso eliminado",
    curso: Curso,
  });
});

module.exports = router;
