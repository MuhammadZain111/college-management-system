const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");
const { hashPassword } = require("../utils/auth");

router.use(requireAuth);

// CEO creates Registrar / Accountant accounts (top of hierarchy only)
router.post("/admins", requireRole("CEO"), async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["REGISTRAR", "ACCOUNTANT"].includes(role)) {
    return res.status(400).json({ message: "CEO can only create Registrar or Accountant accounts." });
  }
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: await hashPassword(password), role, createdById: req.user.id },
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

// Registrar creates Teacher accounts
router.post("/teachers", requireRole("REGISTRAR"), async (req, res) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role: "TEACHER",
      createdById: req.user.id,
      teacherProfile: { create: {} },
    },
    include: { teacherProfile: true },
  });
  res.status(201).json(user);
});

// Registrar creates Student accounts
router.post("/students", requireRole("REGISTRAR"), async (req, res) => {
  const { name, email, password, rollNumber, classId } = req.body;
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role: "STUDENT",
      createdById: req.user.id,
      studentProfile: { create: { rollNumber, classId: classId || null } },
    },
    include: { studentProfile: true },
  });
  res.status(201).json(user);
});

// Registrar: bulk import students/teachers via a pre-parsed JSON array
// (frontend parses the uploaded Excel file with a library and posts rows here)
router.post("/bulk-import", requireRole("REGISTRAR"), async (req, res) => {
  const { rows, role } = req.body; // role: "STUDENT" | "TEACHER"
  if (!Array.isArray(rows) || !rows.length) {
    return res.status(400).json({ message: "No rows to import." });
  }

  const results = { created: 0, failed: [] };
  for (const row of rows) {
    try {
      const data = {
        name: row.name,
        email: String(row.email).toLowerCase(),
        password: await hashPassword(row.password || "Welcome123!"),
        role,
        createdById: req.user.id,
      };
      if (role === "STUDENT") data.studentProfile = { create: { rollNumber: row.rollNumber, classId: row.classId || null } };
      if (role === "TEACHER") data.teacherProfile = { create: {} };

      await prisma.user.create({ data });
      results.created += 1;
    } catch (err) {
      results.failed.push({ row, reason: err.message });
    }
  }
  res.json(results);
});

// List users by role (Registrar/CEO view)
router.get("/", requireRole("CEO", "REGISTRAR"), async (req, res) => {
  const { role } = req.query;
  const users = await prisma.user.findMany({
    where: role ? { role } : { role: { in: ["TEACHER", "STUDENT"] } },
    include: { studentProfile: { include: { class: true } }, teacherProfile: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(users);
});

// Activate / deactivate an account
router.patch("/:id/status", requireRole("CEO", "REGISTRAR"), async (req, res) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive } });
  res.json({ id: user.id, isActive: user.isActive });
});

// Edit basic profile info
router.patch("/:id", requireRole("CEO", "REGISTRAR"), async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { name, email } });
  res.json({ id: user.id, name: user.name, email: user.email });
});

module.exports = router;
