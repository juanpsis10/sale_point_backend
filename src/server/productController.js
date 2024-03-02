const express = require("express");
const router = express.Router();
const MAX_RETRIES = 3; // Número máximo de intentos
const knex = require("knex");
const dbConfig = require("../../knexfile");
const db = knex(dbConfig.development);

router.post("/addproduct", async (req, res) => {
  const { name, description, code, branchId, price } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
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
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al agregar producto (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      await db.destroy();
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al agregar el producto." });
});

router.get("/allproducts", async (req, res) => {
  let retries = 0;

  while (retries < MAX_RETRIES) {
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
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al obtener productos (Intento ${retries + 1}/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      try {
        // Cerrar la conexión a la base de datos
        await db.destroy();
        console.log("Conexión cerrada correctamente");
      } catch (error) {
        console.error("Error al cerrar la conexión:", error);
      }
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al obtener productos." });
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, code } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const updatedProduct = await db("product")
        .where({ id })
        .update({ name, description, code });

      if (updatedProduct === 0) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      res.status(200).json({ message: "Producto actualizado correctamente" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al actualizar el producto (Intento ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      await db.destroy();
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ message: "Error al actualizar el producto" });
});

router.put("/:productId/branch/:branchId", async (req, res) => {
  const { productId, branchId } = req.params;
  const { price, stockQuantity } = req.body;
  let retries = 0;

  while (retries < MAX_RETRIES) {
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
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al actualizar los datos de la sucursal del producto (Intento ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      await db.destroy();
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({
    message: "Error al actualizar los datos de la sucursal del producto",
  });
});

router.put("/:productId/branch/:branchId/disable", async (req, res) => {
  const { productId, branchId } = req.params;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await db("product_branch")
        .where({ product_id: productId, branch_id: branchId })
        .update({ state: "disable" });

      res
        .status(200)
        .json({ message: "Producto desactivado correctamente en la sucursal" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al desactivar producto en la sucursal (Intento ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      await db.destroy();
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res
    .status(500)
    .json({ error: "Error al desactivar producto en la sucursal" });
});

router.put("/:productId/branch/:branchId/activate", async (req, res) => {
  const { productId, branchId } = req.params;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      await db("product_branch")
        .where({ product_id: productId, branch_id: branchId })
        .update({ state: "active" });

      res
        .status(200)
        .json({ message: "Producto activado correctamente en la sucursal" });
      return; // Salir del bucle y devolver la respuesta exitosa
    } catch (error) {
      console.error(
        `Error al activar producto en la sucursal (Intento ${
          retries + 1
        }/${MAX_RETRIES}):`,
        error
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Esperar 2 segundos antes de reintentar
    } finally {
      // Cerrar la conexión a la base de datos
      await db.destroy();
    }
  }

  // Si se alcanza el número máximo de intentos sin éxito
  console.error("Se excedió el número máximo de intentos sin éxito");
  res.status(500).json({ error: "Error al activar producto en la sucursal" });
});

module.exports = router;
