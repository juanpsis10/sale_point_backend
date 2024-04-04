require("isomorphic-fetch");
const express = require("express");
const router = express.Router();

const API_TOKEN = "apis-token-7997.wyE-qDmwo0usY3M2B9Lu7NSZpSZktkY-";
const knex = require("../../knexInstance");

router.get("/apicliente/:documento", async (req, res) => {
  const documento = req.params.documento;

  try {
    let cliente = await knex("client").where({ document: documento }).first();

    if (!cliente) {
      // Si el cliente no se encuentra en la base de datos, consultar la API externa
      const response = await fetch(
        `https://api.apis.net.pe/v2/reniec/dni?numero=${documento}`,
        {
          method: "GET",
          headers: {
            Referer: "https://apis.net.pe/consulta-dni-api",
            Authorization: `Bearer ${API_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al consultar la API externa");
      }

      cliente = await response.json();
    }

    if (!cliente) {
      return res.status(404).json({ message: "Cliente no encontrado." });
    }

    res.json(cliente);
  } catch (error) {
    console.error("Error al buscar cliente:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
