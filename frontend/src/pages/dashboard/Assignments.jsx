import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState, Badge } from "../../components/DashboardBits";

const STATUS_TONE = {
  PENDING: "default",
  SUBMITTED: "success",
  LATE: "warn",
  GRADED: "success",
};

function StudentAssignmentsView() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/assignments/me")
      .then(({ data }) => setAssignments(data))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function submit(id) {
    await api.post(`/assignments/${id}/submit`, { fileUrl: null });
    load();
  }

  return (
    <div>
      <PageHeader
        title="My Assignments"
        subtitle="Pending, submitted, late, and graded work."
      />
      {loading ? (
        <div className="text-sm text-slate">Loading…</div>
      ) : !assignments.length ? (
        <EmptyState message="No assignments yet." />
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const status = a.submission?.status || "PENDING";
            return (
              <div
                key={a.id}
                className="card flex items-center justify-between"
              >
                <div>
                  <h3 className="font-display text-base text-ink">{a.title}</h3>
                  <p className="text-xs text-slate mt-1">
                    {a.subject} · Due{" "}
                    {new Date(a.deadline).toLocaleDateString()} · Max{" "}
                    {a.maxMarks} marks
                  </p>
                  {a.submission?.status === "GRADED" && (
                    <p className="text-xs text-success mt-1">
                      Grade: {a.submission.marksObtained}/{a.maxMarks}
                      {a.submission.feedback
                        ? ` — ${a.submission.feedback}`
                        : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[status]}>{status}</Badge>
                  {status === "PENDING" && (
                    <button
                      onClick={() => submit(a.id)}
                      className="text-xs text-brass hover:text-ink font-medium"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TeacherAssignmentsView() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    maxMarks: 100,
    subjectId: "",
  });
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    api.get("/academics/my-subjects").then(({ data }) => {
      setSubjects(data);
      setForm((f) => ({ ...f, subjectId: data[0]?.id || "" }));
    });
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/assignments", form);
      setCreated(true);
      setForm({ ...form, title: "", description: "", deadline: "" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assignments"
        subtitle="Create assignments for your assigned subjects."
      />
      <form onSubmit={handleCreate} className="card space-y-4 max-w-xl">
        {created && (
          <p className="text-sm text-success">
            Assignment created and rolled out to the class.
          </p>
        )}
        <div>
          <label className="label">Subject</label>
          <select
            className="input"
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {s.class?.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[90px]"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Deadline</label>
            <input
              type="datetime-local"
              className="input"
              required
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Max marks</label>
            <input
              type="number"
              className="input"
              required
              value={form.maxMarks}
              onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
            />
          </div>
        </div>
        <button className="btn-primary" disabled={creating || !subjects.length}>
          {creating ? "Creating…" : "Create Assignment"}
        </button>
        {!subjects.length && (
          <p className="text-xs text-slate">
            You have no assigned subjects yet — ask the Registrar to assign you
            one.
          </p>
        )}
      </form>
    </div>
  );
}

export default function Assignments() {
  const { user } = useAuth();
  return user.role === "STUDENT" ? (
    <StudentAssignmentsView />
  ) : (
    <TeacherAssignmentsView />
  );
}
