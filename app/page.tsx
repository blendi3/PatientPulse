"use client";

import PatientForm from "@/components/forms/PatientForm";
import Image from "next/image";
import PasskeyModal from "@/components/PasskeyModal";
import LandingHero from "@/components/LandingHero";
import LandingHeader from "@/components/LandingHeader";

export default function Home({ searchParams }: SearchParamProps) {
  const isAdmin = searchParams.admin === "true";

  const scrollToForm = () => {
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
        <div className="min-h-screen bg-dark-200">
      {isAdmin && <PasskeyModal />}
      <LandingHeader />

      <LandingHero onBookClick={scrollToForm} />

<section
  id="book"
  className="relative border-t border-dark-500 overflow-hidden py-12 sm:py-24"
>
  <svg
    viewBox="0 0 1200 200"
    className="hidden sm:block absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-40 text-green-500/10 pointer-events-none"
    fill="none"
  >
    <path
      d="M0 100 H480 L510 40 L545 160 L580 100 H1200"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>

  <div className="relative mx-auto max-w-2xl px-4 sm:px-6">
    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center">
      Book your appointment
    </h2>
    <p className="text-14-regular text-dark-700 mb-6 sm:mb-10 text-center">
      Start by telling us who you are.
    </p>
    <PatientForm />
  </div>
</section>

      <footer className="border-t border-dark-500 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-14-regular text-dark-600">
            © 2026 PatientPulse
          </p>
        </div>
      </footer>
    </div>
  );
}