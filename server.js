const express = require("express");
const cors = require("cors");
const knex = require("knex");
const dbConfig = require("./knexfile");

const branchController = require("./src/server/branchController");
const userController = require("./src/server/userController");
const clientController = require("./src/server/clientController");
const productController = require("./src/server/productController");
const saleController = require("./src/server/saleController");
const reportController = require("./src/server/reportController");

// Crear una instancia de la aplicación Express
const app = express();

// Configurar el motor de plantillas y otras configuraciones de Express si es necesario

// Crear una conexión a la base de datos SQLite utilizando Knex
const db = knex(dbConfig.development);

// Agregar middleware para habilitar las solicitudes CORS
app.use(cors());

// Middleware para analizar los datos del cuerpo de la solicitud en formato JSON
app.use(express.json());

// Middleware para analizar los datos del cuerpo de la solicitud en formato de datos codificados en URL
app.use(express.urlencoded({ extended: true }));

app.use("/branch", branchController);
app.use("/user", userController);
app.use("/client", clientController);
app.use("/product", productController);
app.use("/sale", saleController);
app.use("/report", reportController);

// Rutas de ejemplo para consultar la tabla 'users'
app.get("/user", async (req, res) => {
  try {
    const user = await db.select().from("users");
    res.json(user);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios." });
  } finally {
    knex.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

// Ruta para validar usuario y contraseña
app.post("/validate-user", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db("users").where({ username, password }).first();
    if (user) {
      res
        .status(200)
        .json({ username: user.username, role: user.role, id: user.id }); // Incluir el nombre de usuario y el rol en la respuesta
    } else {
      res.status(401).json({ error: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error al validar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    knex.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

// Iniciar el servidor en un puerto específico
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
