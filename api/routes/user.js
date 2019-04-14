const express = require("express");
const router = express.Router();
const uniqid = require("uniqid");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const conn = require("../../connection");
const checkAuth = require("../middleware/check-auth");
const pool = new Pool({
  connectionString: conn
});
pool.connect();
router.get("/", async (req, res, next) => {
  await pool.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.status(502).json({
        error: err
      });
    } else if (result.rowCount > 0) {
      res.status(201).json({
        users: result.rows
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

router.post("/signup", (req, res) => {
  bcrypt.hash(req.body.password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).json({
        error: err
      });
    } else {
      await pool.query(
        "INSERT INTO users (userid, email, password) VALUES ($1, $2, $3)",
        [uniqid(), req.body.email, hash],
        (err, result) => {
          if (err) {
            res.status(502).json({
              error: err
            });
          } else if (result.rowCount > 0) {
            res.status(201).json({
              message: "Signup success"
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
    }
  });
});

router.post("/login", async (req, res, next) => {
  if (req.body.email && req.body.password) {
    await pool.query(
      "SELECT * FROM users where email=$1",
      [req.body.email],
      (err, result) => {
        if (err) {
          res.status(502).json({
            error: err
          });
        } else if (result.rowCount === 0) {
          res.json({
            message: "Authentication failed"
          });
        } else if (result.rowCount > 0) {
          const password = result.rows[0].password;
          bcrypt.compare(req.body.password, password, (err, results) => {
            if (err) {
              return res.json({
                message: "Authentication failed"
              });
            }
            if (results) {
              const token = jwt.sign(
                {
                  email: req.body.email,
                  userid: result.rows[0].userid
                },
                process.env.JWT_PW,
                {
                  expiresIn: "1h"
                }
              );
              return res.status(200).json({
                message: "Authentication successful",
                email: req.body.email,
                token: token
              });
            }
            res.json({
              message: "Authentication failed"
            });
          });
        } else {
          res.status(404).json({
            message: "Something went wrong"
          });
        }
      }
    );
  }
});

router.post("/logout", checkAuth, (req, res, next) => {
  res.json({
    message: req.headers
  });
});

module.exports = router;
