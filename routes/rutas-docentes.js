// rutas-docentes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs"); // Importación de librería
const jwt = require("jsonwebtoken");

const Docente = require("../models/model-docente");

// * Listar todos los docentes
router.get("/", async (req, res, next) => {
  let docentes;
  try {
    docentes = await Docente.find({}).populate("cursos");
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({
    mensaje: "Todos los docentes",
    docentes: docentes,
  });
});

// * Buscar un docente en función del parámetro de búsqueda
router.get("/buscar/:busca", async (req, res, next) => {
  const search = req.params.busca;
  let docentes;
  try {
    docentes = await Docente.find({
      nombre: { $regex: search, $options: "i" },
    });
  } catch (err) {
    const error = new Error("Ha ocurrido un error en la recuperación de datos");
    error.code = 500;
    return next(error);
  }
  res.status(200).json({ mensaje: "Docentes encontrados", docentes: docentes });
});

// * Listar un docente en concreto
router.get("/:id", async (req, res, next) => {
  const idDocente = req.params.id;
  let docente;
  try {
    docente = await Docente.findById(idDocente);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido recuperar los datos"
    );
    error.code = 500;
    return next(error);
  }
  if (!docente) {
    const error = new Error(
      "No se ha podido encontrar un docente con el id proporcionado"
    );
    error.code = 404;
    return next(error);
  }
  res.json({
    mensaje: "Docente encontrado",
    docente: docente,
  });
});

// * Crear nuevo docente
router.post("/", async (req, res, next) => {
  const { nombre, email, password } = req.body;

  let existeDocente;

  try {
    existeDocente = await Docente.findOne({
      email: email,
    });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  if (existeDocente) {
    const error = new Error("Ya existe un docente con ese e-mail.");
    error.code = 401; // ! 401: fallo de autenticación
    return next(error);
    // ! ATENCIÓN: FIJARSE EN DONDE EMPIEZA Y TERMINA ESTE ELSE
  } else {
    // ? Encriptación de password mediante bcrypt y salt
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12); // ? Método que produce la encriptación
    } catch (error) {
      const err = new Error(
        "No se ha podido crear el docente. Inténtelo de nuevo"
      );
      err.code = 500;
      console.log(error.message);
      return next(err);
    }

    const nuevoDocente = new Docente({
      nombre,
      email,
      password: hashedPassword, // ? La nueva password será la encriptada
      cursos: [],
    });

    try {
      await nuevoDocente.save();
    } catch (error) {
      console.log(error.message);
      const err = new Error("No se han podido guardar los datos");
      err.code = 500;
      return next(err);
    }
    try {
      token = jwt.sign(
        { userId: nuevoDocente.id, email: nuevoDocente.email },
        "clave_supermegasecreta",
        { expiresIn: "1h" }
      );
    } catch (error) {
      const err = new Error("El proceso de alta ha fallado");
      err.code = 500;
      return next(err);
    }
    res.status(201).json({
      userId: nuevoDocente.id,
      email: nuevoDocente.email,
      token: token,
    });
  }
});

// ? jwt.sign(payload, clave privada, configuración)

// * Modificar datos de un docente
// router.patch('/:id', async (req, res, next) => {
// 	const { nombre, email, password, cursos, activo } = req.body; // ! Recordar: Destructuring del objeto req.body
// 	const idDocente = req.params.id;
// 	let docenteBuscar;
// 	try {
// 		docenteBuscar = await Docente.findById(idDocente); // (1) Localizamos el docente en la BDD
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha habido algún problema. No se ha podido actualizar la información del docente'
// 		);
// 		err.code = 500;
// 		throw err;
// 	}

// 	// (2) Modificamos el docente
// 	docenteBuscar.nombre = nombre;
// 	docenteBuscar.email = email;
// 	docenteBuscar.password = password;
// 	docenteBuscar.cursos = cursos;
// 	docenteBuscar.activo = activo;

// 	try {
// 		docenteBuscar.save(); // (3) Guardamos los datos del docente en la BDD
// 	} catch (error) {
// 		const err = new Error(
// 			'Ha habido algún problema. No se ha podido guardar la información actualizada'
// 		);
// 		err.code = 500;
// 		throw err;
// 	}
// 	res.status(200).json({
// 		mensaje: 'Datos de docente modificados',
// 		docente: docenteBuscar,
// 	});
// });

// * Modificar datos de un docente - Método más efectivo (findByIdAndUpadate)
router.patch("/:id", async (req, res, next) => {
  const idDocente = req.params.id;
  const camposPorCambiar = req.body;
  let docenteBuscar;
  try {
    docenteBuscar = await Docente.findByIdAndUpdate(
      idDocente,
      camposPorCambiar,
      {
        new: true,
        runValidators: true,
      }
    ); // (1) Localizamos y actualizamos a la vez el docente en la BDD
  } catch (error) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos del docente",
      error: error.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de docente modificados",
    docente: docenteBuscar,
  });
});

// * Eliminar un docente
router.delete("/:id", async (req, res, next) => {
  let docente;
  try {
    docente = await Docente.findByIdAndDelete(req.params.id);
  } catch (err) {
    const error = new Error(
      "Ha habido algún error. No se han podido eliminar los datos"
    );
    error.code = 500;
    return next(error);
  }
  res.json({
    mensaje: "Docente eliminado",
    docente: docente,
  });
});

// * Login de docentes
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let docenteExiste;
  try {
    docenteExiste = await Docente.findOne({
      // (1) Comprobación de email
      email: email,
    });
  } catch (error) {
    const err = new Error(
      "No se ha podido realizar la operación. Pruebe más tarde"
    );
    err.code = 500;
    return next(err);
  }
  if (!docenteExiste) {
    const error = new Error(
      "No se ha podido identificar al docente. Credenciales erróneos 2"
    );
    error.code = 422;
    return next(error);
  }

  let esValidoElPassword = false;
  esValidoElPassword = bcrypt.compareSync(password, docenteExiste.password);
  if (!esValidoElPassword) {
    const error = new Error(
      "No se ha podido identificar al usuario. Credenciales erróneos"
    );
    error.code = 401; // ! 401: Fallo de autenticación
    return next(error);
  }
  // ! CREACIÓN DEL TOKEN
  try {
    token = jwt.sign(
      { userId: docenteExiste.id, email: docenteExiste.email },
      "clave_supermegasecreta",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new Error("El proceso de alta ha fallado");
    err.code = 500;
    return next(err);
  }
  res.status(201).json({
    mensaje: "Docente ha entrado con éxito en el sistema",
    email: docenteExiste.email,
    token: token,
    userId: docenteExiste.id,
  });
});

module.exports = router;
