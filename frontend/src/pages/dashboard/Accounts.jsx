import { useEffect, useState } from "react";
import api from "../../api/client";
import { PageHeader, EmptyState, Badge } from "../../components/DashboardBits";

export default function Accounts() {
  const [role, setRole] = useState("STUDENT");
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    classId: "",
  });
  const [creating, setCreating] = useState(false);

  function load() {
    api.get("/users", { params: { role } }).then(({ data }) => setUsers(data));
  }
  useEffect(load, [role]);
  useEffect(() => {
    api.get("/academics/classes").then(({ data }) => setClasses(data));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      const endpoint =
        role === "STUDENT" ? "/users/students" : "/users/teachers";
      await api.post(endpoint, form);
      setForm({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        classId: "",
      });
      load();
    } finally {
      setCreating(false);
    }
  }

  async function toggleStatus(id, isActive) {
    await api.patch(`/users/${id}/status`, { isActive: !isActive });
    load();
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Create and manage Teacher and Student accounts."
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setRole("STUDENT")}
              className={`text-sm px-4 py-2 rounded-sm ${role === "STUDENT" ? "bg-ink text-paper" : "border border-line text-slate"}`}
            >
              Students
            </button>
            <button
              onClick={() => setRole("TEACHER")}
              className={`text-sm px-4 py-2 rounded-sm ${role === "TEACHER" ? "bg-ink text-paper" : "border border-line text-slate"}`}
            >
              Teachers
            </button>
          </div>
        }
      />

      <form
        onSubmit={handleCreate}
        className="card mb-8 grid md:grid-cols-2 gap-4"
      >
        <h3 className="font-display text-base text-ink md:col-span-2">
          New {role === "STUDENT" ? "Student" : "Teacher"} Account
        </h3>
        <div>
          <label className="label">Full name</label>
          <input
            className="input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Temporary password</label>
          <input
            className="input"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {role === "STUDENT" && (
          <>
            <div>
              <label className="label">Roll number</label>
              <input
                className="input"
                required
                value={form.rollNumber}
                onChange={(e) =>
                  setForm({ ...form, rollNumber: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">Class / Section</label>
              <select
                className="input"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <button className="btn-primary" disabled={creating}>
            {creating ? "Creating…" : "Create Account"}
          </button>
        </div>
      </form>

      {!users.length ? (
        <EmptyState message="No accounts yet." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate border-b border-line">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                {role === "STUDENT" && <th className="py-2 pr-4">Roll No.</th>}
                {role === "STUDENT" && <th className="py-2 pr-4">Class</th>}
                <th className="py-2 pr-4">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4">{u.name}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  {role === "STUDENT" && (
                    <td className="py-3 pr-4">
                      {u.studentProfile?.rollNumber}
                    </td>
                  )}
                  {role === "STUDENT" && (
                    <td className="py-3 pr-4">
                      {u.studentProfile?.class?.name || "—"}
                    </td>
                  )}
                  <td className="py-3 pr-4">
                    <Badge tone={u.isActive ? "success" : "danger"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleStatus(u.id, u.isActive)}
                      className="text-xs text-brass hover:text-ink font-medium"
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
