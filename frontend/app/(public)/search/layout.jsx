// app/(public)/search/layout.jsx

import { Suspense } from "react";

export default function SearchLayout({ children }) {
  return <Suspense fallback={<div>Loading search...</div>}>{children}</Suspense>;
}
