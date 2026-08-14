const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// Teacher creates an assignment for one of their subjects
router.post("/", requireRole("TEACHER"), async (req, res) => {
  const { title, description, deadline, maxMarks, subjectId, fileUrl } = req.body;
  const teacher = await prisma.teacher.findUnique({ where: { userId: req.user.id } });
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.teacherId !== teacher.id) {
    return res.status(403).json({ message: "You can only create assignments for your own subjects." });
  }

  const assignment = await prisma.assignment.create({
    data: { title, description, deadline: new Date(deadline), maxMarks: Number(maxMarks), subjectId, fileUrl },
  });

  // Pre-create PENDING submission rows for every enrolled student so
  // status tracking (Pending/Submitted/Late/Graded) works from day one.
  const students = await prisma.student.findMany({ where: { classId: subject.classId } });
  await prisma.submission.createMany({
    data: students.map((s) => ({ assignmentId: assignment.id, studentId: s.id, status: "PENDING" })),
    skipDuplicates: true,
  });

  res.status(201).json(assignment);
});

// Teacher: view submissions for an assignment
router.get("/:id/submissions", requireRole("TEACHER"), async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { assignmentId: req.params.id },
    include: { student: { include: { user: true } } },
  });
  res.json(submissions);
});

// Teacher: grade a submission with feedback
router.patch("/submissions/:id/grade", requireRole("TEACHER"), async (req, res) => {
  const { marksObtained, feedback } = req.body;
  const submission = await prisma.submission.update({
    where: { id: req.params.id },
    data: { marksObtained: Number(marksObtained), feedback, status: "GRADED" },
  });
  res.json(submission);
});

// Student: list all assignments relevant to their class with their own submission status
router.get("/me", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  if (!student?.classId) return res.json([]);

  const assignments = await prisma.assignment.findMany({
    where: { subject: { classId: student.classId } },
    include: {
      subject: true,
      submissions: { where: { studentId: student.id } },
    },
    orderBy: { deadline: "asc" },
  });

  res.json(
    assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject.name,
      deadline: a.deadline,
      maxMarks: a.maxMarks,
      submission: a.submissions[0] || null,
    }))
  );
});

// Student: submit an assignment (blocked or tagged "Late" per Section 7 policy)
router.post("/:id/submit", requireRole("STUDENT"), async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.id } });
  const assignment = await prisma.assignment.findUnique({ where: { id: req.params.id } });
  if (!assignment) return res.status(404).json({ message: "Assignment not found." });

  const isLate = new Date() > new Date(assignment.deadline);
  const submission = await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
    update: { fileUrl: req.body.fileUrl, submittedAt: new Date(), status: isLate ? "LATE" : "SUBMITTED" },
    create: {
      assignmentId: assignment.id,
      studentId: student.id,
      fileUrl: req.body.fileUrl,
      submittedAt: new Date(),
      status: isLate ? "LATE" : "SUBMITTED",
    },
  });
  res.json(submission);
});

module.exports = router;
