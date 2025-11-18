// components/about/AboutPageContent.jsx

import AboutHero from "./AboutHero";
import AboutMission from "./AboutMission";
import AboutHowItWorks from "./AboutHowItWorks";
import AboutCTA from "./AboutCTA";

export default function AboutPageContent() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto max-w-4xl px-4 py-10 md:py-12">
        <AboutHero />
        <AboutMission />
        <AboutHowItWorks />
        <AboutCTA />
      </div>
    </main>
  );
}
