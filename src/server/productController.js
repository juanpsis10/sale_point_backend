const express = require("express");
const router = express.Router();
const knex = require("knex");
const dbConfig = require("../../knexfile");

const db = knex(dbConfig.development);

router.post("/addproduct", async (req, res) => {
  const { name, description, code, branchId, price } = req.body;
  try {
    const [productId] = await db("product").insert({
      name,
      description,
      code,
    });
    await db("product_branch").insert({
      product_id: productId,
      branch_id: branchId,
      price,
    });
    res.status(201).json({ message: "Producto agregado correctamente" });
  } catch (error) {
    console.error("Error al agregar producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/allproducts", async (req, res) => {
  try {
    const products = await db("product")
      .join("product_branch", "product.id", "=", "product_branch.product_id")
      .join("branch", "branch.id", "=", "product_branch.branch_id")
      .select(
        "product.id",
        "product.name",
        "product.description",
        "product.code",
        "product_branch.stock_quantity",
        "product_branch.price",
        "product_branch.state",
        "branch.id as branch_id",
        "branch.name as branch_name"
      );
    res.json(products);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener productos." });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, code } = req.body;

  try {
    const updatedProduct = await db("product")
      .where({ id })
      .update({ name, description, code });

    if (updatedProduct === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el producto:", error);
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
});

router.put("/:productId/branch/:branchId", async (req, res) => {
  const { productId, branchId } = req.params;
  const { price, stockQuantity } = req.body;

  try {
    const updatedProductBranch = await db("product_branch")
      .where({ product_id: productId, branch_id: branchId })
      .update({ price, stock_quantity: stockQuantity });

    if (updatedProductBranch === 0) {
      return res
        .status(404)
        .json({ message: "Producto o sucursal no encontrados" });
    }

    res.status(200).json({
      message: "Datos de la sucursal del producto actualizados correctamente",
    });
  } catch (error) {
    console.error(
      "Error al actualizar los datos de la sucursal del producto:",
      error
    );
    res.status(500).json({
      message: "Error al actualizar los datos de la sucursal del producto",
    });
  }
});

router.put("/:productId/branch/:branchId/disable", async (req, res) => {
  const { productId, branchId } = req.params;
  try {
    // Realizar la actualización en la base de datos para cambiar el estado del producto en la sucursal a "disable"
    await db("product_branch")
      .where({ product_id: productId, branch_id: branchId })
      .update({ state: "disable" });

    res
      .status(200)
      .json({ message: "Producto desactivado correctamente en la sucursal" });
  } catch (error) {
    console.error("Error al desactivar producto en la sucursal:", error);
    res
      .status(500)
      .json({ error: "Error al desactivar producto en la sucursal" });
  }
});

router.put("/:productId/branch/:branchId/activate", async (req, res) => {
  const { productId, branchId } = req.params;
  try {
    // Realizar la actualización en la base de datos para cambiar el estado del producto en la sucursal a "active"
    await db("product_branch")
      .where({ product_id: productId, branch_id: branchId })
      .update({ state: "active" });

    res
      .status(200)
      .json({ message: "Producto activado correctamente en la sucursal" });
  } catch (error) {
    console.error("Error al activar producto en la sucursal:", error);
    res.status(500).json({ error: "Error al activar producto en la sucursal" });
  }
});

module.exports = router;
