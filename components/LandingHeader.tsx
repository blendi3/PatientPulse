"use client";

import PulseLogo from "@/components/PulseLogo";

import Image from "next/image";
import Link from "next/link";

const LandingHeader = () => (
  <header className="w-full border-b border-dark-500">
    <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2">
        <PulseLogo size={40} />
        <p className="text-16-semibold text-white">PatientPulse</p>
      </div>
      <Link
        href="/?admin=true"
        className="text-14-medium text-dark-700 hover:text-green-500 transition-colors"
      >
        Admin
      </Link>
    </div>
  </header>
);

export default LandingHeader;