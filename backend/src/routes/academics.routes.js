const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// --- Departments ---
router.get("/departments", async (req, res) => {
  res.json(await prisma.department.findMany({ include: { classes: true }, orderBy: { name: "asc" } }));
});

router.post("/departments", requireRole("REGISTRAR"), async (req, res) => {
  const dept = await prisma.department.create({ data: { name: req.body.name } });
  res.status(201).json(dept);
});

// --- Classes / Sections ---
router.get("/classes", async (req, res) => {
  const classes = await prisma.class.findMany({
    include: { department: true, subjects: { include: { teacher: { include: { user: true } } } }, students: true },
    orderBy: { name: "asc" },
  });
  res.json(classes);
});

router.post("/classes", requireRole("REGISTRAR"), async (req, res) => {
  const { name, departmentId } = req.body;
  const cls = await prisma.class.create({ data: { name, departmentId } });
  res.status(201).json(cls);
});

// --- Subjects + teacher assignment ---
router.post("/subjects", requireRole("REGISTRAR"), async (req, res) => {
  const { name, classId, teacherId } = req.body;
  const subject = await prisma.subject.create({ data: { name, classId, teacherId: teacherId || null } });
  res.status(201).json(subject);
});

router.patch("/subjects/:id/assign-teacher", requireRole("REGISTRAR"), async (req, res) => {
  const { teacherId } = req.body;
  const subject = await prisma.subject.update({ where: { id: req.params.id }, data: { teacherId } });
  res.json(subject);
});

// --- Enroll student into a class ---
router.patch("/students/:studentId/enroll", requireRole("REGISTRAR"), async (req, res) => {
  const { classId } = req.body;
  const student = await prisma.student.update({ where: { id: req.params.studentId }, data: { classId } });
  res.json(student);
});

// Teacher: list of subjects assigned to them
router.get("/my-subjects", requireRole("TEACHER"), async (req, res) => {
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
  if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
  const subjects = await prisma.subject.findMany({
    where: { teacherId: teacher.id },
    include: { class: true },
  });
  res.json(subjects);
});

module.exports = router;
