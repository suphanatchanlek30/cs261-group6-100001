// app/(public)/host/page.jsx

import HostShell from "@/components/host-dashboard/HostShell";

export default function HostLayout({ children }) {
  return <HostShell>{children}</HostShell>;
}
