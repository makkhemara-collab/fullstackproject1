const jwt = require("jsonwebtoken");
const TOKEN_SECRET = "ICE_TEA_SECRET_KEY2376428343284jkfsdf";

const validate_token = () => {
  return (req, res, next) => {
    var authorization = req.headers.authorization; 
    var token_from_client = null;
    if (authorization != null && authorization != "") {
      token_from_client = authorization.split(" ")[1]; 
    }

    if (token_from_client == null) {
      res.status(401).send({ message: "Unauthorized" });
    } else {
      jwt.verify(token_from_client, TOKEN_SECRET, (error, result) => {
        if (error) {
          res.status(401).send({ message: "Unauthorized", error: error });
        } else {
          req.user = result; // Contains { email, role }
          next();
        }
      });
    }
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).json({ success: false, message: "Invalid token data." });
    }

    if (allowedRoles.includes(req.user.role)) {
        next(); 
    } else {
        res.status(403).json({ success: false, message: "Access Denied: Managers only." });
    }
  };
};

module.exports = { validate_token, requireRole };