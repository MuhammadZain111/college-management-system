import { Link } from "react-router-dom";
import Seal from "../components/Seal";

const roles = [
  { name: "CEO / Director", desc: "College-wide overview, approvals, and final authority." },
  { name: "Registrar", desc: "Runs daily academic operations — accounts, classes, enrollment." },
  { name: "Accountant", desc: "Fee slips, payment status, and collection reporting." },
  { name: "Teacher", desc: "Attendance, assignments, grading, and results for their classes." },
  { name: "Student", desc: "Attendance, assignments, fee status, and results — all in one place." },
];

export default function Home() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 grid md:grid-cols-[1.3fr,1fr] gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-brass mb-4">Role-Based Academic Management</p>
          <h1 className="font-display text-5xl leading-tight text-ink mb-6">
            One portal, every seat<br />at the college table.
          </h1>
          <p className="text-slate text-lg leading-relaxed mb-8 max-w-xl">
            The Muhammadan Law College Student Portal gives the Director, Registrar,
            Accountant, Teachers, and Students a single system — each seeing exactly
            what their role requires, nothing more.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="btn-primary">Portal Login</Link>
            <Link to="/about" className="btn-secondary">Learn More</Link>
          </div>
        </div>
        <div className="card flex flex-col items-center text-center py-14 bg-ink text-paper border-ink">
          <Seal size={72} />
          <p className="font-display text-xl mt-6">Est. for accountable,<br />transparent administration</p>
          <div className="rule my-6 max-w-[160px]" />
          <p className="text-sm text-brass-light">Attendance · Assignments · Fees · Results · Notices</p>
        </div>
      </section>

      <section className="border-t border-line bg-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-display text-2xl text-ink mb-2">Five roles, one hierarchy</h2>
          <p className="text-slate mb-10 max-w-2xl">
            Every account logs into its own dashboard. Access is structured top-down,
            from college-wide oversight to a single student's own record.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-px bg-line border border-line">
            {roles.map((r, i) => (
              <div key={r.name} className="bg-white p-6">
                <div className="text-xs text-brass font-medium mb-2">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-display text-base text-ink mb-2">{r.name}</h3>
                <p className="text-sm text-slate leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
