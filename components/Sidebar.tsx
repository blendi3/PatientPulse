"use client";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <section className="sidebar z-50">
      <nav className="flex flex-col gap-4">
        <Link
          href="/admin"
          className="mb-12 cursor-pointer flex items-center gap-2"
        >
          <div className="flex items-center gap-1">
            <Image
              src="/assets/icons/logo-icon.svg"
              height={100}
              width={100}
              alt="patient"
              className="size-[45px] xl:h-10 xl:w-fit"
            />
            <p className="sidebar-logo">PatientPulse</p>
          </div>
        </Link>
        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`);

          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("sidebar-link", { "bg-slate-600": isActive })}
            >
              <div className="relative size-6">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({ "brightness-[3] invert-0": isActive })}
                />
              </div>
              <p className={cn("sidebar-label", { "!text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </nav>
    </section>
  );
};

export default Sidebar;
