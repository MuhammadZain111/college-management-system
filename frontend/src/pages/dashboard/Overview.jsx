import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, StatCard } from "../../components/DashboardBits";

const ENDPOINT = {
  CEO: "/dashboard/ceo",
  REGISTRAR: "/dashboard/registrar",
  ACCOUNTANT: "/dashboard/accountant",
  TEACHER: "/dashboard/teacher",
  STUDENT: "/dashboard/student",
};

function statsFor(role, d) {
  if (!d) return [];
  switch (role) {
    case "CEO":
      return [
        { label: "Total Students", value: d.totalStudents },
        { label: "Total Teachers", value: d.totalTeachers },
        { label: "Overall Attendance", value: `${d.overallAttendance}%` },
        { label: "Fee Collection", value: `${d.feeCollectionPercent}%` },
        {
          label: "Fee Defaulters",
          value: d.defaulterCount,
          tone: d.defaulterCount ? "danger" : "success",
        },
      ];
    case "REGISTRAR":
      return [
        { label: "Total Students", value: d.totalStudents },
        { label: "Total Teachers", value: d.totalTeachers },
        { label: "Total Classes", value: d.totalClasses },
        { label: "Pending Assignments", value: d.pendingAssignments },
      ];
    case "ACCOUNTANT":
      return [
        { label: "Total Due (PKR)", value: d.totalDue.toLocaleString() },
        {
          label: "Total Collected (PKR)",
          value: d.totalCollected.toLocaleString(),
          tone: "success",
        },
        {
          label: "Unpaid Slips",
          value: d.unpaidCount,
          tone: d.unpaidCount ? "danger" : "success",
        },
        { label: "Total Slips", value: d.slipCount },
      ];
    case "TEACHER":
      return [
        { label: "Assigned Subjects", value: d.subjectCount },
        { label: "Assignments Created", value: d.assignmentsCount },
        {
          label: "Pending Grading",
          value: d.pendingGrading,
          tone: d.pendingGrading ? "danger" : "success",
        },
      ];
    case "STUDENT":
      return [
        {
          label: "Attendance",
          value: `${d.attendancePercent}%`,
          tone: d.attendancePercent < 75 ? "danger" : "success",
        },
        { label: "Pending Assignments", value: d.pendingAssignments },
        {
          label: "Unpaid Fee Slips",
          value: d.unpaidFees,
          tone: d.unpaidFees ? "danger" : "success",
        },
      ];
    default:
      return [];
  }
}

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(ENDPOINT[user.role])
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, [user.role]);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle="Here's where things stand today."
      />
      {loading ? (
        <div className="text-sm text-slate">Loading dashboard…</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {statsFor(user.role, data).map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}
    </div>
  );
}
