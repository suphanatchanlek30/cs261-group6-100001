// app/(public)/admin/layout.jsx

import AdminShell from "@/components/admin-dashboard/AdminShell";

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
