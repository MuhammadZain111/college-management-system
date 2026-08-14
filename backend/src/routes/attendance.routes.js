const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

const ATTENDANCE_THRESHOLD = 75; // % — configurable per Section 7 policy

async function assertTeacherOwnsSubject(userId, subjectId) {
  const teacher = await prisma.teacher.findUnique({ where: { userId } });
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!teacher || !subject || subject.teacherId !== teacher.id) {
    const err = new Error("You can only manage attendance for your own assigned subjects.");
    err.status = 403;
    throw err;
  }
}

// Teacher marks attendance for a subject/date for a list of students
router.post("/mark", requireRole("TEACHER"), async (req, res) => {
  const { subjectId, date, records } = req.body; // records: [{ studentId, status }]
  await assertTeacherOwnsSubject(req.user.id, subjectId);

  const ops = records.map((r) =>
    prisma.attendance.upsert({
      where: { date_subjectId_studentId: { date: new Date(date), subjectId, studentId: r.studentId } },
      update: { status: r.status },
      create: { date: new Date(date), subjectId, studentId: r.studentId, status: r.status },
    })
  );
  const result = await prisma.$transaction(ops);
  res.json(result);
});

// Teacher edits attendance — same-day only, per policy in Section 7
router.patch("/:id", requireRole("TEACHER"), async (req, res) => {
  const record = await prisma.attendance.findUnique({ where: { id: req.params.id } });
  if (!record) return res.status(404).json({ message: "Attendance record not found." });

  const isSameDay = new Date(record.date).toDateString() === new Date().toDateString();
  if (!isSameDay) {
    return res.status(403).json({ message: "Attendance can only be edited on the same day it was marked." });
  }
  await assertTeacherOwnsSubject(req.user.id, record.subjectId);

  const updated = await prisma.attendance.update({ where: { id: req.params.id }, data: { status: req.body.status } });
  res.json(updated);
});

// Teacher: attendance history for one of their subjects
router.get("/subject/:subjectId", requireRole("TEACHER", "REGISTRAR", "CEO"), async (req, res) => {
  const records = await prisma.attendance.findMany({
    where: { subjectId: req.params.subjectId },
    include: { student: { include: { user: true } } },
    orderBy: { date: "desc" },
  });
  res.json(records);
});

// Student: own attendance, subject-wise % with low-attendance alert
router.get("/me", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!student) return res.status(404).json({ message: "Student profile not found." });

  const records = await prisma.attendance.findMany({
    where: { studentId: student.id },
    include: { subject: true },
    orderBy: { date: "desc" },
  });

  const bySubject = {};
  for (const r of records) {
    const key = r.subjectId;
    if (!bySubject[key]) bySubject[key] = { subject: r.subject.name, present: 0, total: 0 };
    bySubject[key].total += 1;
    if (r.status === "PRESENT" || r.status === "LATE") bySubject[key].present += 1;
  }

  const summary = Object.values(bySubject).map((s) => ({
    ...s,
    percentage: s.total ? Math.round((s.present / s.total) * 100) : 0,
    belowThreshold: s.total ? (s.present / s.total) * 100 < ATTENDANCE_THRESHOLD : false,
  }));

  res.json({ threshold: ATTENDANCE_THRESHOLD, summary, records });
});

module.exports = router;
