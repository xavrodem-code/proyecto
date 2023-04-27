const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const checkAuth = require("../middleware/check-auth");

const Usuario = require("../models/usuariosModels");
const Fecha = require("../models/fechasModels")
const jwt = require("jsonwebtoken");

router.get("/api/usuarios", async (req, res, next) => {
  let usuarios;
  try {
    usuarios = await Usuario.find({});
  } catch (error) {
    const err = new Error("Ha ocurrido un error al recuperar los datos");
    err.code = 500;
    return next(error);
  }
  res.status(200).json({ mensaje: "Todos los usuarios", usuarios: usuarios });
});

router.get("/api/usuarios/:id", async (req, res, next) => {
  const idUsuario = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findById(idUsuario);
  } catch (err) {
    const error = new Error("Ha habido un error al encontrar al usuario");
    error.code = 500;
    return next(err);
  }

  if (!usuario) {
    const error = new Error("No existe ese usuario");
    error.code = 404;
    return next(error);
  }
  res.json({ mensaje: "Usuario encontrado", usuario: usuario });
});

router.post("/api/usuarios/signup", async (req, res, next) => {
  const { email, username, password } = req.body;
  let existeUsuario;
  try {
    existeUsuario = await Usuario.findOne({ email: email });
  } catch (error) {
    const err = new Error(error);
    err.code = 500;
    return next(error);
  }

  if (existeUsuario) {
    const error = new Error("Ya existe ese usuario");
    error.code = 401;
    return next(error);
  } else {
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (error) {
      const err = new Error("No se ha podido crear el usuario");
      err.code = 500;
      return next(error);
    }
    console.log(hashedPassword);
    const nuevoUsuario = new Usuario({
      email,
      username,
      password: hashedPassword,
      fechas: []
    });
    try {
      await nuevoUsuario.save();
    } catch (error) {
      const err = new Error("No se ha podido guardar los datos");
      err.code = 500;
      return next(error);
    }


    res.status(201).json({
      userId: nuevoUsuario.id,
      email: nuevoUsuario.email,
    });
  }
});

router.patch("/api/usuarios/:id", async (req, res, next) => {
  let usuario;
  let idUsuario = req.params.id;
  try {
    console.log("hemos llegado al patch!")
    usuario = await Usuario.findByIdAndUpdate(idUsuario, req.body, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    res.status(404).json({
      mensaje: "No se han podido actualizar los datos",
      error: err.message,
    });
  }
  res.status(200).json({
    mensaje: "Datos de usuario modificados",
    usuario: usuario,
  });
});

router.post("/api/usuarios/login", async (req, res, next) => {
  const { email, password } = req.body;
  let usuarioExiste;
  try {
    usuarioExiste = await Usuario.findOne({ email: email });
  } catch (error) {
    const err = new Error("No se ha podido realizar la operación de login");
    err.code = 500;
    return next(error);
  }

  if (!usuarioExiste) {
    const error = new Error(
      "No se ha podido identificar al usuario, credenciales erróneos"
    );
    error.code = 422; //datos de usuario inválidos
    return next(error);
  }

  let validPassword;
  validPassword = bcrypt.compareSync(password, usuarioExiste.password);
  if (!validPassword) {
    const error = new Error("Mala contraseña");
    error.code = 401;
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: usuarioExiste.id, email: usuarioExiste.email },
      "clave_supermegasecreta",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new Error("El proceso de login ha fallado");
    err.code = 500;
    return next(error);
  }
  res.status(201).json({
    mensaje: "Usuario ha entrado en el sistema con éxito",
    email: usuarioExiste.email,
    token: token,
  });
});

router.use(checkAuth);
router.delete("/api/usuarios/:id", async (req, res, next) => {
  const usuarioId = req.params.id;
  let usuario;
  try {
    usuario = await Usuario.findByIdAndDelete(usuarioId);
  } catch (err) {
    const error = new Error("Ha habido un error al eliminar los datos");
    error.code = 500;
    return next(err);
  }
  res.json({
    message: "Usuario eliminado",
    usuario: usuario,
  });

});

module.exports = router;
