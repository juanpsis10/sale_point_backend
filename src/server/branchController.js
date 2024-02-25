const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

router.post("/addbranch", async (req, res) => {
  const { name, location, manager, phone } = req.body;
  try {
    const [branchId] = await db("branch").insert({
      name,
      location,
      manager,
      phone,
    });
    const newBranch = await db("branch").where({ id: branchId }).first();
    res.status(201).json(newBranch);
  } catch (error) {
    console.error("Error al agregar la sucursal:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/allbranches", async (req, res) => {
  try {
    const branches = await db.select().from("branch");
    res.json(branches);
  } catch (error) {
    console.error("Error al obtener las sucursales:", error);
    res.status(500).json({ error: "Error al obtener las sucursales." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, location, manager, phone } = req.body;

  try {
    await db("branch").where({ id }).update({ name, location, manager, phone });
    const updatedBranch = await db("branch").where({ id }).first();
    res.json(updatedBranch);
  } catch (error) {
    console.error("Error al actualizar la sucursal:", error);
    res.status(500).json({ error: "Error al actualizar la sucursal" });
  }
});

router.put("/:id/disable", async (req, res) => {
  const { id } = req.params;

  try {
    await db("branch").where({ id }).update({ state: "disabled" });
    res.json({ message: "Branch desactivado correctamente" });
  } catch (error) {
    console.error("Error al desactivar el branch:", error);
    res.status(500).json({ error: "Error al desactivar el branch" });
  }
});

router.put("/:id/activate", async (req, res) => {
  const { id } = req.params;

  try {
    await db("branch").where({ id }).update({ state: "active" });
    res.status(200).json({ message: "Sucursal activada correctamente" });
  } catch (error) {
    console.error("Error al activar la sucursal:", error);
    res.status(500).json({ error: "Error al activar la sucursal" });
  }
});

module.exports = router;
