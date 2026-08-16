const jwt = require("jsonwebtoken");

// Unlike authMiddleware, this never blocks the request. If a valid token
// is present it attaches req.user; if it's missing or invalid, the request
// just continues without req.user set. Used on public routes where we want
// to know who's viewing *if* they happen to be logged in.
module.exports = function optionalAuthMiddleware(req, res, next) {
  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) return next();

  const token = authorizationHeader.split(" ")[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err && decoded) {
      req.user = { id: decoded.id, role: decoded.role };
    }
    next();
  });
};