const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    req.auth = false;
    next();
  } else {
    try {
      const secret = process.env.JWT_SECRET;
      const payload = jwt.verify(token, secret);
      req.user = payload;
      req.auth = true;
      next();
    } catch (error) {
      res.send(400).send("Invalid token");
    }
  }
}

module.exports = auth;
