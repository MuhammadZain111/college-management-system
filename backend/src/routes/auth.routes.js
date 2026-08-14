const router = require("express").Router();
const prisma = require("../utils/prisma");
const { signToken, comparePassword } = require("../utils/auth");
const { requireAuth } = require("../middleware/auth");

// POST /api/auth/login  — used by all 5 roles, same form
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !user.isActive) {
    return res.status(401).json({ message: "Invalid credentials or inactive account." });
  }

  const valid = await comparePassword(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me — verify token and return fresh user info
router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;
