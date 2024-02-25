const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

router.post("/adduser", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const [userId] = await db("users").insert({
      username,
      password,
      role,
    });
    const newUser = await db("users").where({ id: userId }).first();
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error al agregar usuario:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  } finally {
    db.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

router.get("/allusers", async (req, res) => {
  try {
    const users = await db.select().from("users"); // Utilizamos la instancia de Knex para realizar la consulta
    res.json(users);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios." });
  } finally {
    db.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;

  try {
    const updatedUser = { username, role };
    if (password) {
      updatedUser.password = password;
    }
    await db("users").where({ id }).update(updatedUser);
    const user = await db("users").where({ id }).first();
    res.json(user);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ error: "Error al actualizar usuario" });
  } finally {
    db.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

router.put("/:id/activate", async (req, res) => {
  const { id } = req.params;

  try {
    await db("users").where({ id }).update({ state: "active" });
    res.status(200).json({ message: "Usuario activado correctamente" });
  } catch (error) {
    console.error("Error al activar usuario:", error);
    res.status(500).json({ error: "Error al activar usuario" });
  } finally {
    db.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

router.put("/:id/disable", async (req, res) => {
  const { id } = req.params;

  try {
    await db("users").where({ id }).update({ state: "disable" });
    res.status(200).json({ message: "Usuario desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar usuario:", error);
    res.status(500).json({ error: "Error al desactivar usuario" });
  } finally {
    db.destroy(); // Aquí se cierra la conexión de Knex después de que se completa la consulta
  }
});

module.exports = router;
