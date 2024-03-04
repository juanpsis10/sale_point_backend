const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("../../knexInstance");

router.delete("/eliminar_venta/:numeroDocumento", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { numeroDocumento } = req.params;

      // Obtener todas las ventas con el mismo número de documento
      const ventas = await knex("sale").where({
        document_number: numeroDocumento,
      });

      if (ventas.length === 0) {
        return res.status(404).json({
          error: "No se encontraron ventas con este número de documento",
        });
      }

      // Eliminar cada venta y restablecer el stock correspondiente
      await Promise.all(
        ventas.map(async (venta) => {
          // Eliminar la venta de la tabla 'sale'
          await knex("sale").where({ id: venta.id }).del();

          // Restablecer el stock del producto en la sucursal correspondiente
          await knex("product_branch")
            .where({ product_id: venta.product_id, branch_id: venta.branch_id })
            .increment("stock_quantity", venta.cantidad_producto);
        })
      );

      res.status(200).json({ message: "Venta eliminada exitosamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al eliminar la venta (Intento ${retries + 1}/${MAX_RETRIES}):`,
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

router.get("/ventas-del-dia", async (req, res) => {
  const { fecha } = req.query;
  const [year, month, day] = fecha.split("-");
  const fechasinformato = `${year}-${month}-${day}`;
  console.log("fecha sin formato: " + fechasinformato);
  const formattedMonth = parseInt(month, 10).toString(); // Eliminar el cero inicial
  const formattedDay = parseInt(day, 10).toString(); // Eliminar el cero inicial
  const formattedFecha = `${formattedMonth}/${formattedDay}/${year}`;
  console.log("fecha serv:" + formattedFecha);
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Consulta SQL parametrizada para obtener las ventas del día
      const result = await knex
        .select(
          "u.username AS usuario",
          "c.name AS cliente",
          "sale.document_number AS numero_documento",
          knex.raw("MIN(sale.date) AS primer_fecha"),
          knex.raw("SUM(sale.total) AS total_venta"),
          "sale.payment_method" // Agregar la columna payment_method
        )
        .from("sale")
        .join("users as u", "sale.user_id", "=", "u.id")
        .join("client as c", "sale.client_id", "=", "c.id")
        .where("date", "LIKE", `${fechasinformato}%`)
        .groupBy("sale.document_number")
        .orderBy("sale.document_number", "desc");

      if (!result || result.length === 0) {
        return res.status(404).json({
          error: "No se encontraron ventas para la fecha especificada",
        });
      }

      // Enviar las ventas del día como respuesta
      res.json(result);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener las ventas del día (Intento ${
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

module.exports = router;
