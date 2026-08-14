require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const academicsRoutes = require("./routes/academics.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const assignmentsRoutes = require("./routes/assignments.routes");
const feesRoutes = require("./routes/fees.routes");
const resultsRoutes = require("./routes/results.routes");
const noticesRoutes = require("./routes/notices.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "college-portal-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/academics", academicsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/assignments", assignmentsRoutes);
app.use("/api/fees", feesRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/notices", noticesRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`College Portal API running on port ${PORT}`));
