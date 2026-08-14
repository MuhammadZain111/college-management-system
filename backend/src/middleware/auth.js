const jwt = require("jsonwebtoken");

/**
 * Verifies the JWT sent in the Authorization header and attaches
 * the decoded payload to req.user. Every protected route uses this.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated. Please log in." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

/**
 * Restricts a route to one or more roles.
 * Usage: requireRole("REGISTRAR", "CEO")
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do this." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
