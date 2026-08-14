// Catches errors thrown (or passed via next(err)) from any route.
// Combined with "express-async-errors", async route handlers that throw
// are routed here automatically without try/catch boilerplate everywhere.
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === "P2002") {
    // Prisma unique constraint violation
    return res.status(409).json({ message: `A record with this ${err.meta?.target?.join(", ")} already exists.` });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ message: "Record not found." });
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Something went wrong on the server." });
}

module.exports = errorHandler;
