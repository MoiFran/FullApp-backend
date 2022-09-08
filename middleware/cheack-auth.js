const jwt = require("jsonwebtoken");

const autorizacion = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new Error("fallo de autenticación 1");
    }
    decodedToken = jwt.verify(token, "clave_supermegasecreta");
    req.userData = {
      userId: decodedToken.userId,
      userEmail: decodedToken.email,
    };
    next();
  } catch (error) {
    const err = new Error("error de autenticacion 2 ");
    err.doce = 401;
    return next(err);
  }
};

module.exports = autorizacion;
