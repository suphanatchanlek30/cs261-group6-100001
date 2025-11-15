// components/host-dashboard/profile/ProfileDetailsCard.jsx
"use client";

export default function ProfileDetailsCard({ profile }) {
  if (!profile) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
      <div className="space-y-3 text-sm">
        <Row label="Host ID" value={profile.id} mono />
        <Row label="Full Name" value={profile.fullName} />
        <Row label="Email" value={profile.email} />
        <Row label="Roles" value={profile.roles?.join(', ') || '-'} />
      </div>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
      <div className="w-32 text-gray-500 font-medium text-xs uppercase tracking-wide">{label}</div>
      <div className={`flex-1 text-gray-800 ${mono ? 'font-mono break-all' : ''}`}>{value ?? '-'}</div>
    </div>
  );
}
