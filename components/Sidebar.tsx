"use client";
import PulseLogo from "@/components/PulseLogo";

import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMvp, setIsMvp] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const user = await account.get();
        const labels = (user as any).labels || [];
        setIsMvp(labels.includes("mvp"));
      } catch (error) {
        console.error("Error fetching user role:", error);
      } finally {
        setRoleLoaded(true);
      }
    };
    fetchRole();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await account.deleteSession("current");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const visibleLinks = sidebarLinks.filter(
    (item) => !item.mvpOnly || isMvp
  );

  return (
    <section className="sidebar z-50">
      <nav className="flex flex-col gap-4 flex-1">
        <Link
          href="/admin"
          className="mb-12 cursor-pointer flex items-center gap-2"
        >
          <div className="flex items-center gap-1">
            <PulseLogo size={40} />
            <p className="sidebar-logo">PatientPulse</p>
          </div>
        </Link>
        {roleLoaded &&
          visibleLinks.map((item) => {
            const isActive =
              item.route === "/admin"
                ? pathname === "/admin"
                : pathname === item.route || pathname.startsWith(`${item.route}/`);

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

      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="sidebar-link mt-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
      >
        <LogOut className="size-6" />
        <p className="sidebar-label">
          {isLoggingOut ? "Logging out..." : "Log out"}
        </p>
      </button>
    </section>
  );
};

export default Sidebar;