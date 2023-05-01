const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

app.use("/", require("./routes/usuariosRoute"));
app.use("/", require("./routes/fechasRoute"));

app.use((req, res) => {
  res.status(404);
  res.json({
    mensaje: "Info no encontrada",
  });
});

mongoose
  .connect(process.env.MONGO_DB_URI)
  .then(() => {
    console.log("Conectado a la base");
    app.listen(process.env.PORT, () =>
      console.log(`Escuchando en puerto ${process.env.PORT}`)
    );
  })
  .catch((error) => console.log(error));
