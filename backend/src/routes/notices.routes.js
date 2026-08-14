const router = require("express").Router();
const prisma = require("../utils/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// CEO posts major notices, Registrar posts routine notices, Accountant posts fee reminders
router.post("/", requireRole("CEO", "REGISTRAR", "ACCOUNTANT"), async (req, res) => {
  const { title, message, audience } = req.body;
  const notice = await prisma.notice.create({
    data: { title, message, audience: audience || "ALL", postedById: req.user.id },
  });
  res.status(201).json(notice);
});

// Everyone can read the notice board, filtered to their audience
router.get("/", requireAuth, async (req, res) => {
  const role = req.user.role;
  const audienceFilter =
    role === "TEACHER" ? ["ALL", "TEACHERS"] : role === "STUDENT" ? ["ALL", "STUDENTS"] : ["ALL", "TEACHERS", "STUDENTS"];

  const notices = await prisma.notice.findMany({
    where: { audience: { in: audienceFilter } },
    include: { postedBy: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notices);
});

router.delete("/:id", requireRole("CEO", "REGISTRAR", "ACCOUNTANT"), async (req, res) => {
  await prisma.notice.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = router;
