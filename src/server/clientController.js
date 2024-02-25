const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

router.post("/addclient", async (req, res) => {
  const { name, document, phone } = req.body;
  try {
    const [clientId] = await db("client").insert({
      name,
      document,
      phone,
    });
    const newClient = await db("client").where({ id: clientId }).first();
    res.status(201).json(newClient);
  } catch (error) {
    console.error("Error al agregar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/allclients", async (req, res) => {
  try {
    const clients = await db.select().from("client");
    res.json(clients);
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    res.status(500).json({ error: "Error al obtener clientes." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, document, phone } = req.body;

  try {
    await db("client").where({ id }).update({
      name,
      document,
      phone,
    });
    const client = await db("client").where({ id }).first();
    res.json(client);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

module.exports = router;
