export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-slate mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, tone = "default" }) {
  const toneClass = tone === "danger" ? "text-danger" : tone === "success" ? "text-success" : "text-ink";
  return (
    <div className="card">
      <div className={`font-display text-3xl ${toneClass}`}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="card text-center text-sm text-slate py-12">{message}</div>;
}

export function Badge({ children, tone = "default" }) {
  const tones = {
    default: "bg-slate/10 text-slate",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    warn: "bg-warn/10 text-warn",
  };
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${tones[tone]}`}>{children}</span>;
}
