import { useEffect, useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/DashboardBits";

const CAN_POST = ["CEO", "REGISTRAR", "ACCOUNTANT"];

export default function Notices() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", message: "", audience: "ALL" });
  const [posting, setPosting] = useState(false);

  function load() {
    setLoading(true);
    api
      .get("/notices")
      .then(({ data }) => setNotices(data))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handlePost(e) {
    e.preventDefault();
    setPosting(true);
    try {
      await api.post("/notices", form);
      setForm({ title: "", message: "", audience: "ALL" });
      load();
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Notice Board" subtitle="College-wide and role-specific announcements." />

      {CAN_POST.includes(user.role) && (
        <form onSubmit={handlePost} className="card mb-8 space-y-4">
          <h3 className="font-display text-base text-ink">Post a Notice</h3>
          <input
            className="input"
            placeholder="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="input min-h-[100px]"
            placeholder="Message"
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="flex items-center gap-4">
            <select
              className="input w-auto"
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
            >
              <option value="ALL">Everyone</option>
              <option value="TEACHERS">Teachers only</option>
              <option value="STUDENTS">Students only</option>
            </select>
            <button className="btn-primary" disabled={posting}>{posting ? "Posting…" : "Post Notice"}</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-sm text-slate">Loading notices…</div>
      ) : notices.length === 0 ? (
        <EmptyState message="No notices yet." />
      ) : (
        <div className="space-y-4">
          {notices.map((n) => (
            <div key={n.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-base text-ink">{n.title}</h3>
                <span className="text-xs text-slate">{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-charcoal leading-relaxed mb-2">{n.message}</p>
              <p className="text-xs text-slate">— {n.postedBy?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
