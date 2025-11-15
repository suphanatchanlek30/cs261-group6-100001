import { redirect } from "next/navigation";

export default function HostSection() {
  // Redirect the host root to the Financial Report tab by default
  redirect("/host/payments");
}
