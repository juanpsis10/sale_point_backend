const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("../../knexInstance");

// Ruta para buscar clientes por documento o nombre
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    // Realizar la búsqueda en la base de datos
    const clients = await knex("client")
      .where("document", "like", `%${query}%`)
      .orWhere("name", "like", `%${query}%`);

    res.status(200).json(clients);
  } catch (error) {
    console.error("Error al buscar clientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.post("/addclient", async (req, res) => {
  const { name, document, phone } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const [clientId] = await knex("client").insert({
        name,
        document,
        phone,
      });

      const newClient = await knex("client").where({ id: clientId }).first();

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
      const clients = await knex.select().from("client");

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
  const { name, document, phone, points } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await knex("client").where({ id }).update({
        name,
        document,
        phone,
        points, // Agregar la actualización de la columna points
      });

      const client = await knex("client").where({ id }).first();

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

module.exports = router;
