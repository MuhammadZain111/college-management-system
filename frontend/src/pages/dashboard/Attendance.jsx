import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState, Badge } from "../../components/DashboardBits";

function StudentAttendanceView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/attendance/me")
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="My Attendance"
        subtitle={data ? `College threshold: ${data.threshold}%` : ""}
      />
      {loading ? (
        <div className="text-sm text-slate">Loading…</div>
      ) : !data?.summary.length ? (
        <EmptyState message="No attendance recorded yet." />
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {data.summary.map((s) => (
            <div key={s.subject} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-base text-ink">{s.subject}</h3>
                {s.belowThreshold && (
                  <Badge tone="danger">Below threshold</Badge>
                )}
              </div>
              <div
                className={`stat-value ${s.belowThreshold ? "text-danger" : ""}`}
              >
                {s.percentage}%
              </div>
              <p className="text-xs text-slate mt-1">
                {s.present} / {s.total} classes attended
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherAttendanceView() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/academics/my-subjects").then(({ data }) => {
      setSubjects(data);
      if (data[0]) setSubjectId(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!subjectId) return;
    const subject = subjects.find((s) => s.id === subjectId);
    // Roster comes from the class's enrolled students; simplified fetch via academics/classes
    api.get("/academics/classes").then(({ data }) => {
      const cls = data.find((c) => c.id === subject?.classId);
      setRecords(
        (cls?.students || []).map((st) => ({
          studentId: st.id,
          name: st.rollNumber,
          status: "PRESENT",
        })),
      );
    });
  }, [subjectId, subjects]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.post("/attendance/mark", {
        subjectId,
        date,
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
        })),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subtitle="Editable same-day only, per college policy."
      />
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Subject</label>
          <select
            className="input"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.class?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !records.length}
          className="btn-primary"
        >
          {saving ? "Saving…" : "Save Attendance"}
        </button>
      </div>

      {!records.length ? (
        <EmptyState message="No students enrolled in this class yet." />
      ) : (
        <div className="card divide-y divide-line">
          {records.map((r, idx) => (
            <div
              key={r.studentId}
              className="flex items-center justify-between py-3"
            >
              <span className="text-sm">Roll No. {r.name}</span>
              <select
                className="input w-auto"
                value={r.status}
                onChange={(e) => {
                  const next = [...records];
                  next[idx].status = e.target.value;
                  setRecords(next);
                }}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  return user.role === "STUDENT" ? (
    <StudentAttendanceView />
  ) : (
    <TeacherAttendanceView />
  );
}
