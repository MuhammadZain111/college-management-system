import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/DashboardBits";

function StudentResultsView() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/results/me").then(({ data }) => setResults(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="My Results" subtitle="Marks entered by your subject teachers." />
      {loading ? (
        <div className="text-sm text-slate">Loading…</div>
      ) : !results.length ? (
        <EmptyState message="No results uploaded yet." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate border-b border-line">
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Exam</th>
                <th className="py-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4">{r.subject.name}</td>
                  <td className="py-3 pr-4">{r.examType}</td>
                  <td className="py-3">{Number(r.marksObtained)} / {Number(r.totalMarks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TeacherResultsView() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ examType: "Midterm", totalMarks: 100 });
  const [marks, setMarks] = useState({});
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
    api.get("/academics/classes").then(({ data }) => {
      const cls = data.find((c) => c.id === subject?.classId);
      setStudents(cls?.students || []);
    });
  }, [subjectId, subjects]);

  async function handleSave() {
    setSaving(true);
    try {
      await Promise.all(
        students.map((s) =>
          marks[s.id] != null
            ? api.post("/results", {
                studentId: s.id,
                subjectId,
                examType: form.examType,
                marksObtained: Number(marks[s.id]),
                totalMarks: Number(form.totalMarks),
              })
            : null
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Enter Results" subtitle="Marks are simple per-exam entries, not a full transcript." />
      <div className="card mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="label">Subject</label>
          <select className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Exam type</label>
          <input className="input" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })} />
        </div>
        <div>
          <label className="label">Total marks</label>
          <input type="number" className="input w-24" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })} />
        </div>
        <button onClick={handleSave} disabled={saving || !students.length} className="btn-primary">
          {saving ? "Saving…" : "Save Marks"}
        </button>
      </div>

      {!students.length ? (
        <EmptyState message="No students enrolled in this class yet." />
      ) : (
        <div className="card divide-y divide-line">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between py-3">
              <span className="text-sm">Roll No. {s.rollNumber}</span>
              <input
                type="number"
                className="input w-24"
                placeholder="Marks"
                value={marks[s.id] ?? ""}
                onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Results() {
  const { user } = useAuth();
  return user.role === "STUDENT" ? <StudentResultsView /> : <TeacherResultsView />;
}
