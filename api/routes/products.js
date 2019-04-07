const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 8
  },
  fileFilter: fileFilter
});
const router = express.Router();
const { Pool } = require("pg");
const conn = require("../../connection");
const pool = new Pool({
  connectionString: conn
});
pool.connect();
router.get("/", async (req, res, next) => {
  await pool.query("SELECT * FROM products", (err, result) => {
    if (err) {
      res.status(502).json({
        error: err
      });
    } else if (result.rowCount > 0) {
      res.status(201).json({
        products: result.rows
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
  });
});

router.post("/", upload.single("productImage"), async (req, res) => {
  await pool.query(
    "INSERT INTO products(name, price, image) VALUES ($1, $2, $3)",
    [req.body.name, req.body.price, req.file.path],
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
    "SELECT * FROM products where id=$1",
    [id],
    (err, result) => {
      if (err) {
        res.status(502).json({
          error: err
        });
      } else if (result.rowCount > 0) {
        res.status(201).json({
          products: result.rows
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

router.patch("/:id", async (req, res, next) => {
  const id = req.params.id;
  await pool.query(
    "UPDATE products SET name=$1, price=$2 where id=$3",
    [req.body.name, req.body.price, id],
    (err, result) => {
      if (err) {
        res.status(502).json({
          error: err
        });
      } else if (result.rowCount > 0) {
        res.status(201).json({
          message: "Successfully updated"
        });
      } else {
        res.status(400).json({
          message: "Something went wrong"
        });
      }
    }
  );
});

router.delete("/:id", async (req, res, next) => {
  const id = req.params.id;
  await pool.query("DELETE FROM products where id=$1", [id], (err, result) => {
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
