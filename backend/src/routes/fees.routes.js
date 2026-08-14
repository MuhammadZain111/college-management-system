const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// Accountant: view all students with fee status, filterable
router.get("/", requireRole("ACCOUNTANT", "CEO"), async (req, res) => {
  const { status } = req.query;
  const slips = await prisma.feeSlip.findMany({
    where: status ? { status } : undefined,
    include: { student: { include: { user: true, class: true } } },
    orderBy: { dueDate: "asc" },
  });
  res.json(slips);
});

// Accountant: generate a fee slip for one student
router.post("/", requireRole("ACCOUNTANT"), async (req, res) => {
  const { studentId, amount, dueDate, month } = req.body;
  const slip = await prisma.feeSlip.create({
    data: { studentId, amount, dueDate: new Date(dueDate), month, status: "UNPAID" },
  });
  res.status(201).json(slip);
});

// Accountant: generate fee slips for an entire class at once
router.post("/bulk-class", requireRole("ACCOUNTANT"), async (req, res) => {
  const { classId, amount, dueDate, month } = req.body;
  const students = await prisma.student.findMany({ where: { classId } });
  const slips = await prisma.feeSlip.createMany({
    data: students.map((s) => ({ studentId: s.id, amount, dueDate: new Date(dueDate), month, status: "UNPAID" })),
  });
  res.status(201).json(slips);
});

// Accountant: mark a slip as paid
router.patch("/:id/mark-paid", requireRole("ACCOUNTANT"), async (req, res) => {
  const slip = await prisma.feeSlip.update({
    where: { id: req.params.id },
    data: { status: "PAID", paidAt: new Date() },
  });
  res.json(slip);
});

router.patch("/:id/status", requireRole("ACCOUNTANT"), async (req, res) => {
  const { status } = req.body; // UNPAID | PARTIAL | PAID | OVERDUE
  const slip = await prisma.feeSlip.update({ where: { id: req.params.id }, data: { status } });
  res.json(slip);
});

// Accountant: collection report (monthly totals + defaulter list)
router.get("/report", requireRole("ACCOUNTANT", "CEO"), async (req, res) => {
  const slips = await prisma.feeSlip.findMany({ include: { student: { include: { user: true } } } });
  const totalDue = slips.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalCollected = slips.filter((s) => s.status === "PAID").reduce((sum, s) => sum + Number(s.amount), 0);
  const defaulters = slips.filter((s) => s.status === "OVERDUE" || s.status === "UNPAID");

  res.json({
    totalDue,
    totalCollected,
    collectionPercent: totalDue ? Math.round((totalCollected / totalDue) * 100) : 0,
    defaulterCount: defaulters.length,
    defaulters,
  });
});

// Student: own fee status
router.get("/me", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  const slips = await prisma.feeSlip.findMany({ where: { studentId: student.id }, orderBy: { dueDate: "desc" } });
  res.json(slips);
});

module.exports = router;
