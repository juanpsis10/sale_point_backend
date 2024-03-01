const express = require("express");
const cors = require("cors");
const knex = require("knex");
const dbConfig = require("./knexfile");
const cron = require("node-cron"); // Importa la biblioteca de tareas programadas
const MAX_RETRIES = 3; // Número máximo de intentos
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
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const users = await db.select().from("users");
      res.json(users);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener usuarios (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error interno del servidor" });
});

app.post("/validate-user", async (req, res) => {
  const { username, password } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const user = await db("users").where({ username, password }).first();
      if (user) {
        res
          .status(200)
          .json({ username: user.username, role: user.role, id: user.id }); // Incluir el nombre de usuario y el rol en la respuesta
        return; // Salir del bucle y devolver la respuesta exitosa
      } else {
        res.status(401).json({ error: "Credenciales incorrectas" });
        return; // Salir del bucle y devolver la respuesta de error de autenticación
      }
    } catch (error) {
      console.error(
        `Error al validar usuario (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error interno del servidor" });
});

// Endpoint para mantener activa la sesión del usuario
app.get("/keep-alive", async (req, res) => {
  console.log("Token escuchando en el backend.");

  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Realizar la consulta SQL para obtener el nombre del cliente con ID 1
      const client = await db("client").select("name").where("id", 1).first();

      console.log("Token escuchando en la base de datos.");

      // Enviar el nombre del cliente como respuesta
      res.status(200).json({ clientName: client.name });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener el nombre del cliente (Intento ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar el servidor en un puerto específico
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
