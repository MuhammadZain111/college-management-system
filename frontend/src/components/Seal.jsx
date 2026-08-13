// The portal's signature mark: a lined circular seal referencing a college
// crest / legal notary stamp, rendered in brass on navy. Used small in the
// nav and large on the login and about pages.
export default function Seal({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" stroke="#B08D57" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="25" stroke="#B08D57" strokeWidth="1" />
      <path
        d="M32 16 L38 26 H26 Z M22 30 H42 M24 30 V40 M40 30 V40 M20 44 H44"
        stroke="#B08D57"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="32" y="53" textAnchor="middle" fontSize="6" fill="#B08D57" fontFamily="Georgia, serif" letterSpacing="1">
        MLC
      </text>
    </svg>
  );
}
