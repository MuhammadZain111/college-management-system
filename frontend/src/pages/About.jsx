export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-xs uppercase tracking-[0.25em] text-brass mb-4">About the Portal</p>
      <h1 className="font-display text-4xl text-ink mb-8">Built for how the college actually runs</h1>

      <div className="rule mb-10 max-w-[160px]" />

      <div className="prose-none space-y-6 text-slate leading-relaxed text-[15px]">
        <p>
          Muhammadan Law College's Student Portal replaces scattered registers,
          WhatsApp groups, and paper fee slips with one role-based system. Every
          person — from the Director to a first-semester student — logs in to a
          dashboard built for their responsibilities alone.
        </p>
        <p>
          The system was scoped and agreed upon in writing between the college and
          the development team before a single line of code was built, covering
          every role's exact responsibilities, the ten core modules, and the
          academic policies that govern them — attendance thresholds, late-submission
          rules, and fee due dates.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-14">
        <div className="card">
          <h3 className="font-display text-lg text-ink mb-3">Why role-based access</h3>
          <p className="text-sm text-slate leading-relaxed">
            A Teacher should never need to see fee records, and an Accountant should
            never need to see grades. Narrow, well-defined access keeps the system
            simple to use and easy to audit.
          </p>
        </div>
        <div className="card">
          <h3 className="font-display text-lg text-ink mb-3">Written policy, not guesswork</h3>
          <p className="text-sm text-slate leading-relaxed">
            Attendance thresholds, late-submission handling, and fee due dates are
            configured to match policies the college has agreed to in writing —
            not left to individual interpretation.
          </p>
        </div>
      </div>

      <div className="mt-14 card bg-ink text-paper border-ink">
        <h3 className="font-display text-lg mb-2">Development &amp; Support</h3>
        <p className="text-sm text-brass-light leading-relaxed">
          Prepared by Muhammad Asif and Muhammad Zain. A one-month free bug-fix
          period follows handover; ongoing maintenance thereafter is available as a
          separate retainer.
        </p>
      </div>
    </div>
  );
}
