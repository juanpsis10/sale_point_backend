const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");
const MAX_RETRIES = 3; // Número máximo de intentos
const db = knex(dbConfig.development);

router.get("/ventas-del-dia", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Obtener la fecha actual en el formato de tu base de datos
      const fecha = new Date().toLocaleDateString("en-US", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const partesFecha = fecha.split("/");
      const formattedFecha =
        partesFecha[2] + "-" + partesFecha[0] + "-" + partesFecha[1];
      console.log("fecha de ventas: " + formattedFecha);
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
        .where("date", "LIKE", `${formattedFecha}%`); // Filtrar por la fecha del día especificado

      // Enviar los resultados como respuesta al cliente
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

router.get("/total-ventas", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Obtener la fecha actual en el formato de tu base de datos
      const fecha = new Date().toLocaleDateString("en-US", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const partesFecha = fecha.split("/");
      const formattedFecha =
        partesFecha[2] + "-" + partesFecha[0] + "-" + partesFecha[1];
      console.log("fecha de ventas: " + formattedFecha);
      // Consulta SQL parametrizada para obtener el total de ventas del día
      const result = await db
        .select(db.raw("SUM(total) AS total_ventas"))
        .from("sale")
        .where("date", "LIKE", `${formattedFecha}%`); // Filtrar por la fecha del día especificado

      const totalVentas = result[0].total_ventas; // Acceder directamente al total de ventas

      if (!totalVentas) {
        return res.status(404).json({
          error: "No se encontraron ventas para la fecha especificada",
        });
      }
      // Enviar el total de ventas como respuesta
      res.json({ total_ventas: totalVentas });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener el total de ventas (Intento ${
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

// Ruta para obtener el primer cliente
router.get("/primercliente", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Obtener el primer cliente de la base de datos
      const primerCliente = await db("client").first();
      if (!primerCliente) {
        return res
          .status(404)
          .json({ message: "No se encontró ningún cliente." });
      }
      res.json(primerCliente);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener el primer cliente (Intento ${
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
  res.status(500).json({
    error: "Error interno del servidor al obtener el primer cliente.",
  });
});

router.post("/registrar-venta", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const {
        client_id,
        user_id,
        branch_id,
        product_id,
        document_number,
        cantidad_producto,
        total,
        date, // Agregar la fecha y hora de la venta
      } = req.body;
      // Crear un objeto de fecha a partir de la cadena recibida
      const fechaHora = new Date(date);

      // Obtener las partes de la fecha y hora
      const year = fechaHora.getFullYear();
      const month = (fechaHora.getMonth() + 1).toString().padStart(2, "0"); // El mes es 0-indexado, por lo que necesitas sumar 1
      const day = fechaHora.getDate().toString().padStart(2, "0");
      const hours = fechaHora.getHours().toString().padStart(2, "0");
      const minutes = fechaHora.getMinutes().toString().padStart(2, "0");
      const seconds = fechaHora.getSeconds().toString().padStart(2, "0");

      // Formatear la fecha y hora en el formato deseado (YYYY-MM-DD HH:MM:SS)
      const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      console.log("fecha formateada en la api: " + formattedDate);
      // Insertar la venta en la base de datos
      await db("sale").insert({
        client_id,
        user_id,
        branch_id,
        product_id,
        document_number,
        cantidad_producto,
        total,
        date: formattedDate, // Agregar la fecha y hora de la venta
      });
      // Actualizar el stock del producto en la sucursal
      await db("product_branch")
        .where({ product_id, branch_id })
        .decrement("stock_quantity", cantidad_producto);

      res.status(200).json({ message: "Venta registrada exitosamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al registrar la venta (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({
    error: "Error interno del servidor al registrar la venta",
  });
});

router.get("/last-document-number", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Consulta para obtener el último número de documento
      const lastDocument = await db("sale")
        .orderBy("document_number", "desc")
        .select("document_number")
        .limit(1)
        .first();

      // Si no hay ventas registradas aún, asignamos el número inicial
      let nextDocumentNumber = 1;
      if (lastDocument) {
        // Incrementamos el último número de documento en 1
        nextDocumentNumber = lastDocument.document_number + 1;
      }

      // Formateamos el número de documento para que tenga 9 dígitos
      const formattedDocumentNumber = String(nextDocumentNumber).padStart(
        9,
        "0"
      );

      res.status(200).json({ document_number: formattedDocumentNumber });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener el último número de documento (Intento ${
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
