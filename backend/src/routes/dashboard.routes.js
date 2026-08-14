const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// CEO — college-wide overview
router.get("/ceo", requireRole("CEO"), async (req, res) => {
  const [totalStudents, totalTeachers, attendanceRecords, feeSlips] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.attendance.findMany(),
    prisma.feeSlip.findMany(),
  ]);

  const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const overallAttendance = attendanceRecords.length ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;

  const totalDue = feeSlips.reduce((s, f) => s + Number(f.amount), 0);
  const totalCollected = feeSlips.filter((f) => f.status === "PAID").reduce((s, f) => s + Number(f.amount), 0);
  const feeCollectionPercent = totalDue ? Math.round((totalCollected / totalDue) * 100) : 0;
  const defaulterCount = feeSlips.filter((f) => f.status === "OVERDUE" || f.status === "UNPAID").length;

  res.json({ totalStudents, totalTeachers, overallAttendance, feeCollectionPercent, defaulterCount });
});

// Registrar — operational snapshot
router.get("/registrar", requireRole("REGISTRAR"), async (req, res) => {
  const [totalStudents, totalTeachers, totalClasses, pendingAssignments] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.class.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
  ]);
  res.json({ totalStudents, totalTeachers, totalClasses, pendingAssignments });
});

// Accountant — fee-focused snapshot
router.get("/accountant", requireRole("ACCOUNTANT"), async (req, res) => {
  const feeSlips = await prisma.feeSlip.findMany();
  const totalDue = feeSlips.reduce((s, f) => s + Number(f.amount), 0);
  const totalCollected = feeSlips.filter((f) => f.status === "PAID").reduce((s, f) => s + Number(f.amount), 0);
  const unpaidCount = feeSlips.filter((f) => f.status !== "PAID").length;
  res.json({ totalDue, totalCollected, unpaidCount, slipCount: feeSlips.length });
});

// Teacher — personal summary
router.get("/teacher", requireRole("TEACHER"), async (req, res) => {
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id }, include: { subjects: true } });
  const subjectIds = teacher?.subjects.map((s) => s.id) || [];
  const [assignmentsCount, pendingGrading] = await Promise.all([
    prisma.assignment.count({ where: { subjectId: { in: subjectIds } } }),
    prisma.submission.count({ where: { assignment: { subjectId: { in: subjectIds } }, status: { in: ["SUBMITTED", "LATE"] } } }),
  ]);
  res.json({ subjectCount: subjectIds.length, assignmentsCount, pendingGrading });
});

// Student — personal summary
router.get("/student", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  const [attendanceRecords, pendingAssignments, unpaidFees] = await Promise.all([
    prisma.attendance.findMany({ where: { studentId: student.id } }),
    prisma.submission.count({ where: { studentId: student.id, status: "PENDING" } }),
    prisma.feeSlip.count({ where: { studentId: student.id, status: { in: ["UNPAID", "OVERDUE"] } } }),
  ]);
  const presentCount = attendanceRecords.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
  const attendancePercent = attendanceRecords.length ? Math.round((presentCount / attendanceRecords.length) * 100) : 0;
  res.json({ attendancePercent, pendingAssignments, unpaidFees });
});

module.exports = router;
