const mongoose = require("mongoose");
require("dotenv").config();

const cors = require("cors");
const express = require("express");
const app = express();
const corsOptions = {
  origin: "https://proyectazo.netlify.app",
  optionsSuccessStatus: 200,
};
app.use(express.json());
app.use(cors(corsOptions));
app.use(cors());

app.use("/api/usuarios", require("./routes/usuariosRoute"));
app.use("/api/fechas", require("./routes/fechasRoute"));

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
