// components/help/HelpPageContent.jsx

import HelpHero from "./HelpHero";
import HelpFAQ from "./HelpFAQ";
import HelpContact from "./HelpContact";

export default function HelpPageContent() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
        <HelpHero />
        <HelpFAQ />
        <HelpContact />
      </div>
    </main>
  );
}
