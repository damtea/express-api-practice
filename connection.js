const conn =
  "postgresql://damtea:" + process.env.POSTGRESS_PW + "@localhost:5432/express";
module.exports = conn;
