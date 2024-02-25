const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

router.get("/ventas-del-dia", async (req, res) => {
  const { fecha } = req.query;
  const [year, month, day] = fecha.split("-");
  const fechasinformato = `${year}-${month}-${day}`;
  console.log("fecha sin formato: " + fechasinformato);
  const formattedMonth = parseInt(month, 10).toString(); // Eliminar el cero inicial
  const formattedDay = parseInt(day, 10).toString(); // Eliminar el cero inicial
  const formattedFecha = `${formattedMonth}/${formattedDay}/${year}`;
  console.log("fecha serv:" + formattedFecha);

  try {
    // Consulta SQL parametrizada para obtener las ventas del día
    const result = await db
      .select(
        "u.username AS usuario",
        "c.name AS cliente",
        "sale.document_number AS numero_documento",
        db.raw("MIN(sale.date) AS primer_fecha"),
        db.raw("SUM(sale.total) AS total_venta")
      )
      .from("sale")
      .join("users as u", "sale.user_id", "=", "u.id")
      .join("client as c", "sale.client_id", "=", "c.id")
      .where("date", "LIKE", `${fechasinformato}%`)
      .groupBy("sale.document_number");

    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron ventas para la fecha especificada" });
    }

    // Enviar las ventas del día como respuesta
    res.json(result);
  } catch (error) {
    console.error("Error al obtener las ventas del día:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
