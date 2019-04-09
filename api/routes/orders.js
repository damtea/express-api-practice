const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const conn = require("../../connection");
const pool = new Pool({
  connectionString: conn
});

pool.connect();
router.get("/", async (req, res, next) => {
  await pool.query(
    'SELECT orders.id, orders."productId", products.name, products.price FROM orders JOIN products ON (orders."productId" = products.id)',
    (err, result) => {
      if (err) {
        res.status(502).json({
          error: err
        });
      } else if (result.rowCount > 0) {
        var orders = [];
        orders = result.rows.map(data => {
          return {
            id: data.id,
            products: {
              id: data.productId,
              name: data.name,
              price: data.price
            }
          };
        });
        res.status(200).json({
          orders: orders
        });
      } else if (result.rowCount === 0) {
        res.status(404).json({
          message: "Not found"
        });
      } else {
        res.status(404).json({
          message: "Something went wrong"
        });
      }
    }
  );
});

router.post("/", async (req, res, next) => {
  console.log(process.env.POSTGRESS_PW);
  await pool.query(
    'INSERT INTO orders ("productId") VALUES ($1)',
    [req.body.productId],
    (err, result) => {
      if (err) {
        res.status(502).json({
          error: err
        });
      } else if (result.rowCount > 0) {
        res.status(201).json({
          message: "Successfully inserted"
        });
      } else if (result.rowCount === 0) {
        res.status(404).json({
          message: "Not found"
        });
      } else {
        res.status(404).json({
          message: "Something went wrong"
        });
      }
    }
  );
});
router.get("/:id", async (req, res, next) => {
  const id = req.params.id;
  await pool.query(
    'SELECT orders.id, orders."productId", products.name, products.price FROM orders JOIN products ON (orders."productId" = products.id) and orders.id=$1',
    [req.params.id],
    (err, result) => {
      if (err) {
        res.status(502).json({
          error: err
        });
      } else if (result.rowCount > 0) {
        var orders = [];
        orders = result.rows.map(data => {
          return {
            id: data.id,
            products: {
              id: data.productId,
              name: data.name,
              price: data.price
            }
          };
        });
        res.status(200).json({
          orders: orders
        });
      } else if (result.rowCount === 0) {
        res.status(404).json({
          message: "Not found"
        });
      } else {
        res.status(404).json({
          message: "Something went wrong"
        });
      }
    }
  );
});

router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  await pool.query("DELETE FROM orders where id=$1", [id], (err, result) => {
    if (err) {
      res.status(502).json({
        error: err
      });
    } else if (result.rowCount > 0) {
      res.status(201).json({
        message: "Successfully deleted"
      });
    } else if (result.rowCount === 0) {
      res.status(404).json({
        message: "Not found"
      });
    } else {
      res.status(400).json({
        message: "Something went wrong"
      });
    }
  });
});
module.exports = router;
