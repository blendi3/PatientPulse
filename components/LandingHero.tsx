"use client";

import { useEffect, useState } from "react";
import { getCreatedRoles } from "@/lib/actions/doctor.actions";
import { UserPlus, CalendarCheck, MailCheck } from "lucide-react";

const PulseLine = () => (
  <svg
    viewBox="0 0 400 40"
    className="w-full max-w-[220px] sm:max-w-xs h-8 sm:h-10 text-green-500"
    fill="none"
  >
    <path
      d="M0 20 H140 L155 5 L170 35 L185 20 H400"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="1"
      className="animate-[dash_2.4s_ease-in-out_infinite]"
      style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
    />
  </svg>
);

const steps = [
  {
    icon: UserPlus,
    title: "Tell us about yourself",
    description: "A short intake form, done in a couple of minutes.",
  },
  {
    icon: CalendarCheck,
    title: "Pick a doctor and time",
    description: "Choose a specialist and a slot that works for you.",
  },
  {
    icon: MailCheck,
    title: "We confirm the rest",
    description: "You'll hear from us to confirm your appointment.",
  },
];

const LandingHero = ({ onBookClick }: { onBookClick: () => void }) => {
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  useEffect(() => {
    const fetchSpecializations = async () => {
      const specs = await getCreatedRoles();
      setSpecializations(specs);
    };
    fetchSpecializations();
  }, []);

  const visibleSpecs = showAllSpecs
    ? specializations
    : specializations.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="py-12 sm:py-20 md:py-28 flex flex-col items-start gap-5 sm:gap-6 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
          Care, scheduled on your time.
        </h1>
        <p className="text-15-regular sm:text-16-regular md:text-18-regular text-dark-700 max-w-lg">
          Register once, pick the specialist you need, and book an
          appointment in minutes — no phone calls, no waiting on hold.
        </p>
        <PulseLine />
        <button
          onClick={onBookClick}
          className="shad-primary-btn h-12 px-8 rounded-lg text-16-semibold w-full sm:w-auto"
        >
          Book an appointment
        </button>
      </section>

      <section className="py-10 sm:py-16 space-y-6 sm:space-y-8 border-t border-dark-500">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="rounded-xl border border-dark-500 bg-dark-400 p-5 sm:p-6 space-y-3"
            >
              <div className="flex items-center justify-center size-10 rounded-full bg-green-500/10">
                <step.icon className="size-5 text-green-500" />
              </div>
              <p className="text-15-semibold text-white">{step.title}</p>
              <p className="text-14-regular text-dark-700">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {specializations.length > 0 && (
        <section className="pb-10 sm:pb-16 space-y-5 sm:space-y-6 border-t border-dark-500 pt-10 sm:pt-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            What we treat
          </h2>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {visibleSpecs.map((spec, i) => (
              <span
                key={i}
                className="text-13-medium sm:text-14-medium text-white border border-dark-500 bg-dark-400 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
              >
                {spec}
              </span>
            ))}
            {!showAllSpecs && specializations.length > 6 && (
              <button
                onClick={() => setShowAllSpecs(true)}
                className="text-13-medium sm:text-14-medium text-green-500 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
              >
                +{specializations.length - 6} more
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default LandingHero;