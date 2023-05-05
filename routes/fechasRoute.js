const express = require("express");
const router = express.Router();

const checkAuth = require("../middleware/check-auth");
const Fecha = require("../models/fechasModels");
const Usuario = require("../models/usuariosModels");

router.use(checkAuth);

router.get("/", async (req, res, next) => {
  let fechas;
  try {
    fechas = await Fecha.find({}).populate("usuario");
  } catch (err) {
    const error = new Error("No se pueden mostrar las fechas");
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    fechas: fechas,
  });
});

router.post("/registrar", async (req, res, next) => {
  const { fecha, usuario } = req.body;
  let buscarUsuario;
  let existeFecha;
  let nuevaFecha;
  try {
    buscarUsuario = await Usuario.findById(usuario);
    existeFecha = await Fecha.findOne({ fecha: fecha, usuario: usuario });
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(err);
  }
  if (!buscarUsuario) {
    const error = new Error(
      "No se ha podido encontrar el usuario con el ID proporcionado"
    );
    error.code = 404;
    return next(error);
  }

  if (existeFecha) {
    const error = new Error("Ya existe esa fecha");
    error.code = 401;
    return next(error);
  } else {
    const nuevaFecha = new Fecha({
      fecha,
      usuario,
    });
    try {
      await nuevaFecha.save();
      buscarUsuario.fechas.push(nuevaFecha);
      await buscarUsuario.save();
    } catch (error) {
      const err = new Error("No se ha podido guardar la fecha");
      err.code = 500;
      return next(error);
    }
  }

  res.status(201).json({
    mensaje: "Nueva fecha introducida",
    fecha: nuevaFecha,
  });
});

router.patch("/:id", async (req, res, next) => {
  let fecha;
  let idFecha = req.params.id;
  try {
    fecha = await Fecha.findByIdAndUpdate(idFecha, req.body, {
      new: true,
      runValidators: true,
    });
  } catch (err) {
    res.status(404).json({
      mensaje: "No se ha podido modificar la fecha",
      error: err.message,
    });
  }
  res.status(200).json({
    mensaje: "Fecha modificada",
    fecha: fecha,
  });
});

router.delete("/:id", async (req, res, next) => {
  let fecha;
  try {
    fecha = await Fecha.findById(req.params.id).populate("usuario");
  } catch (err) {
    const error = new Error("Ha habido un error");
    error.code = 500;
    return next(err);
  }

  if (!fecha) {
    const error = new Error("No se ha podido encontrar la fecha");
    error.code = 404;
    return next(error);
  }

  try {
    await fecha.deleteOne();
    fecha.usuario.fechas.pull(fecha._id);
    await fecha.usuario.save();
  } catch (err) {
    const error = new Error("Ha ocurrido un error");
    error.code = 500;
    return next(err);
  }
  res.json({
    mensaje: "Fecha borrada",
    fecha: fecha,
  });
});

module.exports = router;
