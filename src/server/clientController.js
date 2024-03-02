const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("knex");
const dbConfig = require("../../knexfile");
// Middleware para abrir la conexión a la base de datos en cada solicitud
router.use((req, res, next) => {
  req.db = knex(dbConfig.development);
  next();
});

router.post("/addclient", async (req, res) => {
  const { name, document, phone } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const [clientId] = await req.db("client").insert({
        name,
        document,
        phone,
      });

      const newClient = await req.db("client").where({ id: clientId }).first();

      res.status(201).json(newClient);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al agregar cliente (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al agregar el cliente." });
});

router.get("/allclients", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const clients = await req.db.select().from("client");

      res.json(clients);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener clientes (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al obtener los clientes." });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, document, phone } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await req.db("client").where({ id }).update({
        name,
        document,
        phone,
      });

      const client = await req.db("client").where({ id }).first();

      res.json(client);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al actualizar cliente (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al actualizar el cliente." });
});

// Middleware para cerrar la conexión a la base de datos al final de cada solicitud
router.use((req, res, next) => {
  req.db.destroy();
  next();
});

module.exports = router;
