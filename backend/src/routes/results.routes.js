const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// Teacher enters/updates marks for a subject exam
router.post("/", requireRole("TEACHER"), async (req, res) => {
  const { studentId, subjectId, examType, marksObtained, totalMarks } = req.body;
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.teacherId !== teacher.id) {
    return res.status(403).json({ message: "You can only enter results for your own subjects." });
  }

  const result = await prisma.result.upsert({
    where: { studentId_subjectId_examType: { studentId, subjectId, examType } },
    update: { marksObtained, totalMarks },
    create: { studentId, subjectId, examType, marksObtained, totalMarks },
  });
  res.json(result);
});

// Teacher: view results entered for a subject
router.get("/subject/:subjectId", requireRole("TEACHER", "REGISTRAR", "CEO"), async (req, res) => {
  const results = await prisma.result.findMany({
    where: { subjectId: req.params.subjectId },
    include: { student: { include: { user: true } } },
  });
  res.json(results);
});

// Student: own results (simple marks table)
router.get("/me", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  const results = await prisma.result.findMany({
    where: { studentId: student.id },
    include: { subject: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(results);
});

module.exports = router;
