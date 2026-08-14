import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Placeholder: wire this up to a /api/contact route + email service
    // (e.g. Nodemailer) if the college wants inbound messages routed to
    // the Registrar's office inbox. Kept as a UI-only form for now.
    setSent(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-brass mb-4">
          Get in Touch
        </p>
        <h1 className="font-display text-4xl text-ink mb-6">
          Contact the college office
        </h1>
        <p className="text-slate leading-relaxed mb-10">
          For login issues, account requests, or general enquiries, reach the
          Registrar's office directly. Students should first check with their
          class teacher for academic matters.
        </p>

        <dl className="space-y-6 text-sm">
          <div>
            <dt className="stat-label mb-1">Address</dt>
            <dd className="text-charcoal">
              Muhammadan Law College, Lahore, Punjab, Pakistan
            </dd>
          </div>
          <div>
            <dt className="stat-label mb-1">Registrar's Office</dt>
            <dd className="text-charcoal">
              registrar@muhammadanlaw.edu.pk · +92 42 XXX XXXX
            </dd>
          </div>
          <div>
            <dt className="stat-label mb-1">Accounts Office</dt>
            <dd className="text-charcoal">accounts@muhammadanlaw.edu.pk</dd>
          </div>
          <div>
            <dt className="stat-label mb-1">Office Hours</dt>
            <dd className="text-charcoal">
              Monday – Saturday, 9:00 AM – 4:00 PM
            </dd>
          </div>
        </dl>
      </div>

      <div className="card">
        {sent ? (
          <div className="py-10 text-center">
            <h3 className="font-display text-xl text-ink mb-2">
              Message received
            </h3>
            <p className="text-sm text-slate">
              The office will get back to you within one working day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input min-h-[140px]"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
