export default function PublicFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm text-slate">
        <p>
          © {new Date().getFullYear()} Muhammadan Law College. All rights
          reserved.
        </p>
        <p>Student Portal — Attendance · Assignments · Fees · Results</p>
      </div>
    </footer>
  );
}
