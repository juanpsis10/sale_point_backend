const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("../../knexInstance");

router.post("/adduser", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { username, password, role } = req.body;
      const [userId] = await knex("users").insert({
        username,
        password,
        role,
      });
      const newUser = await knex("users").where({ id: userId }).first();
      res.status(201).json(newUser);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al agregar usuario (Intento ${retries + 1}/${MAX_RETRIES}):`,
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

router.get("/allusers", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const users = await knex.select().from("users");
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

router.put("/:id", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { id } = req.params;
      const { username, password, role } = req.body;

      const updatedUser = { username, role };
      if (password) {
        updatedUser.password = password;
      }

      await knex("users").where({ id }).update(updatedUser);
      const user = await knex("users").where({ id }).first();
      res.json(user);
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al actualizar usuario (Intento ${retries + 1}/${MAX_RETRIES}):`,
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

router.put("/:id/activate", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { id } = req.params;

      await knex("users").where({ id }).update({ state: "active" });
      res.status(200).json({ message: "Usuario activado correctamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al activar usuario (Intento ${retries + 1}/${MAX_RETRIES}):`,
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

router.put("/:id/disable", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const { id } = req.params;

      await knex("users").where({ id }).update({ state: "disable" });
      res.status(200).json({ message: "Usuario desactivado correctamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al desactivar usuario (Intento ${retries + 1}/${MAX_RETRIES}):`,
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
