const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("knex");
const dbConfig = require("../../knexfile");
const db = knex(dbConfig.development);

router.post("/addbranch", async (req, res) => {
  const { name, location, manager, phone } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const [branchId] = await db("branch").insert({
        name,
        location,
        manager,
        phone,
      });

      const newBranch = await db("branch").where({ id: branchId }).first();

      res.status(201).json(newBranch);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al agregar la sucursal (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al agregar la sucursal." });
});

router.get("/allbranches", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const branches = await db.select().from("branch");

      res.json(branches);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener las sucursales (Intento ${
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
  res.status(500).json({ error: "Error al obtener las sucursales." });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, manager, phone } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await req
        .db("branch")
        .where({ id })
        .update({ name, location, manager, phone });
      const updatedBranch = await db("branch").where({ id }).first();

      res.json(updatedBranch);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al actualizar la sucursal (Intento ${
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
  res.status(500).json({ error: "Error al actualizar la sucursal." });
});

router.put("/:id/disable", async (req, res) => {
  const { id } = req.params;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await db("branch").where({ id }).update({ state: "disabled" });

      res.json({ message: "Branch desactivado correctamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al desactivar el branch (Intento ${
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
  res.status(500).json({ error: "Error al desactivar el branch." });
});

router.put("/:id/activate", async (req, res) => {
  const { id } = req.params;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await db("branch").where({ id }).update({ state: "active" });

      res.status(200).json({ message: "Sucursal activada correctamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al activar la sucursal (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al activar la sucursal." });
});

module.exports = router;
