import { useEffect, useState } from "react";
import api from "../../api/client";
import { PageHeader, EmptyState } from "../../components/DashboardBits";

export default function Academics() {
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [deptName, setDeptName] = useState("");
  const [classForm, setClassForm] = useState({ name: "", departmentId: "" });
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    classId: "",
    teacherId: "",
  });

  function loadAll() {
    api.get("/academics/departments").then(({ data }) => setDepartments(data));
    api.get("/academics/classes").then(({ data }) => setClasses(data));
    api
      .get("/users", { params: { role: "TEACHER" } })
      .then(({ data }) => setTeachers(data));
  }
  useEffect(loadAll, []);

  async function addDepartment(e) {
    e.preventDefault();
    await api.post("/academics/departments", { name: deptName });
    setDeptName("");
    loadAll();
  }

  async function addClass(e) {
    e.preventDefault();
    await api.post("/academics/classes", classForm);
    setClassForm({ name: "", departmentId: "" });
    loadAll();
  }

  async function addSubject(e) {
    e.preventDefault();
    await api.post("/academics/subjects", {
      ...subjectForm,
      teacherId: subjectForm.teacherId || null,
    });
    setSubjectForm({ name: "", classId: "", teacherId: "" });
    loadAll();
  }

  return (
    <div>
      <PageHeader
        title="Classes & Subjects"
        subtitle="Departments, classes/sections, and subject-teacher assignment."
      />

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <form onSubmit={addDepartment} className="card space-y-3">
          <h3 className="font-display text-base text-ink">New Department</h3>
          <input
            className="input"
            required
            placeholder="e.g. Bachelor of Laws"
            value={deptName}
            onChange={(e) => setDeptName(e.target.value)}
          />
          <button className="btn-secondary w-full">Add Department</button>
        </form>

        <form onSubmit={addClass} className="card space-y-3">
          <h3 className="font-display text-base text-ink">
            New Class / Section
          </h3>
          <select
            className="input"
            required
            value={classForm.departmentId}
            onChange={(e) =>
              setClassForm({ ...classForm, departmentId: e.target.value })
            }
          >
            <option value="">Select department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            required
            placeholder="e.g. Semester 3 - Section B"
            value={classForm.name}
            onChange={(e) =>
              setClassForm({ ...classForm, name: e.target.value })
            }
          />
          <button className="btn-secondary w-full">Add Class</button>
        </form>

        <form onSubmit={addSubject} className="card space-y-3">
          <h3 className="font-display text-base text-ink">New Subject</h3>
          <select
            className="input"
            required
            value={subjectForm.classId}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, classId: e.target.value })
            }
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            required
            placeholder="e.g. Constitutional Law"
            value={subjectForm.name}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, name: e.target.value })
            }
          />
          <select
            className="input"
            value={subjectForm.teacherId}
            onChange={(e) =>
              setSubjectForm({ ...subjectForm, teacherId: e.target.value })
            }
          >
            <option value="">Assign teacher later</option>
            {teachers.map((t) => (
              <option key={t.teacherProfile?.id} value={t.teacherProfile?.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button className="btn-secondary w-full">Add Subject</button>
        </form>
      </div>

      {!classes.length ? (
        <EmptyState message="No classes created yet." />
      ) : (
        <div className="space-y-4">
          {classes.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-base text-ink">{c.name}</h3>
                <span className="text-xs text-slate">
                  {c.department?.name} · {c.students?.length || 0} students
                </span>
              </div>
              {!c.subjects?.length ? (
                <p className="text-sm text-slate">No subjects added yet.</p>
              ) : (
                <ul className="text-sm divide-y divide-line">
                  {c.subjects.map((s) => (
                    <li key={s.id} className="py-2 flex justify-between">
                      <span>{s.name}</span>
                      <span className="text-slate">
                        {s.teacher?.user?.name || "Unassigned"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
