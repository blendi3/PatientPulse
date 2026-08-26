"use client";

import { useEffect, useState, useMemo } from "react";
import { createNotification } from "@/lib/actions/notification.actions";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import {
  getDoctorsWithPendingRequests,
  approveUnavailableDate,
  denyUnavailableDate,
  getDoctorList,
} from "@/lib/actions/doctor.actions";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import PulseLogo from "@/components/PulseLogo";
import SearchBar from "@/components/SearchBar";
import Image from "next/image";
import { getImageUrl, cn } from "@/lib/utils";
import { Check, X, CalendarClock, Users, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Range = {
  doctor: any;
  dates: string[];
  startDate: string;
  endDate: string;
};

const dayMs = 86400000;

const toRanges = (dates: string[], doctor: any): Range[] => {
  const sorted = [...dates].sort();
  const ranges: Range[] = [];
  let current: string[] = [];

  sorted.forEach((dateStr, idx) => {
    if (current.length === 0) {
      current = [dateStr];
    } else {
      const prev = new Date(current[current.length - 1] + "T00:00:00");
      const thisDate = new Date(dateStr + "T00:00:00");
      const diff = (thisDate.getTime() - prev.getTime()) / dayMs;
      if (diff === 1) {
        current.push(dateStr);
      } else {
        ranges.push({ doctor, dates: current, startDate: current[0], endDate: current[current.length - 1] });
        current = [dateStr];
      }
    }
    if (idx === sorted.length - 1 && current.length > 0) {
      ranges.push({ doctor, dates: current, startDate: current[0], endDate: current[current.length - 1] });
    }
  });

  return ranges;
};

const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) =>
  aStart <= bEnd && bStart <= aEnd;

const DayOffRequestsPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const loadData = async () => {
    const [pending, allResponse] = await Promise.all([
      getDoctorsWithPendingRequests(),
      getDoctorList(),
    ]);
    setPendingDoctors(pending);
    setAllDoctors(allResponse.documents);
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await account.get();
        const labels = (user as any).labels || [];
        if (!labels.includes("mvp")) {
          router.push("/admin");
          return;
        }
        setAuthorized(true);
        await loadData();
      } catch {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };
    checkAccess();
  }, [router]);

  const specialtyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allDoctors.forEach((doc) => {
      counts[doc.specialization] = (counts[doc.specialization] || 0) + 1;
    });
    return counts;
  }, [allDoctors]);

  // Already-approved ranges, per doctor, used for conflict checking
  const approvedRanges = useMemo(() => {
    const ranges: Range[] = [];
    allDoctors.forEach((doctor) => {
      if (doctor.unavailableDates?.length) {
        ranges.push(...toRanges(doctor.unavailableDates, doctor));
      }
    });
    return ranges;
  }, [allDoctors]);

  const pendingRanges = useMemo(() => {
    const ranges: Range[] = [];
    pendingDoctors.forEach((doctor) => {
      if (doctor.pendingUnavailableDates?.length) {
        ranges.push(...toRanges(doctor.pendingUnavailableDates, doctor));
      }
    });
    return ranges.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [pendingDoctors]);

  const rangesWithConflict = useMemo(() => {
    return pendingRanges.map((range) => {
      const specialty = range.doctor.specialization;
      const total = specialtyCounts[specialty] || 1;

      const overlappingOthers = [
        ...approvedRanges,
        ...pendingRanges.filter((r) => r.doctor.$id !== range.doctor.$id),
      ].filter(
        (r) =>
          r.doctor.specialization === specialty &&
          r.doctor.$id !== range.doctor.$id &&
          rangesOverlap(range.startDate, range.endDate, r.startDate, r.endDate)
      );

      const uniqueOverlappingDoctors = new Set(overlappingOthers.map((r) => r.doctor.$id));
      const wouldBeOutCount = uniqueOverlappingDoctors.size + 1;

      return {
        ...range,
        specialtyTotal: total,
        wouldBeOutCount,
        isConflict: wouldBeOutCount >= total,
      };
    });
  }, [pendingRanges, approvedRanges, specialtyCounts]);

  const filteredRanges = rangesWithConflict.filter((r) =>
    r.doctor.name.toLowerCase().includes(query.toLowerCase())
  );

  const conflictCount = rangesWithConflict.filter((r) => r.isConflict).length;
  const affectedDoctorCount = new Set(pendingDoctors.map((d) => d.$id)).size;

  const handleApprove = async (range: Range) => {
    const key = `${range.doctor.$id}-${range.startDate}`;
    setProcessingKey(key);
    try {
      for (const d of range.dates) {
        await approveUnavailableDate(range.doctor.$id, d);
      }
      const dateLabel =
        range.startDate === range.endDate
          ? formatDateLabel(range.startDate)
          : `${formatDateLabel(range.startDate)} → ${formatDateLabel(range.endDate)}`;
      await createNotification(
        range.doctor.$id,
        `Your day off request for ${dateLabel} was approved.`,
        "approved"
      );
      toast.success(`Approved ${range.dates.length} day${range.dates.length > 1 ? "s" : ""}.`);
      await loadData();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProcessingKey(null);
    }
  };

  const handleDeny = async (range: Range) => {
    const key = `${range.doctor.$id}-${range.startDate}`;
    setProcessingKey(key);
    try {
      for (const d of range.dates) {
        await denyUnavailableDate(range.doctor.$id, d);
      }
      const dateLabel =
        range.startDate === range.endDate
          ? formatDateLabel(range.startDate)
          : `${formatDateLabel(range.startDate)} → ${formatDateLabel(range.endDate)}`;
      await createNotification(
        range.doctor.$id,
        `Your day off request for ${dateLabel} was denied.`,
        "denied"
      );
      toast.success(`Denied ${range.dates.length} day${range.dates.length > 1 ? "s" : ""}.`);
      await loadData();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setProcessingKey(null);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (!authorized) return null;

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="root-layout">
        <PulseLogo size={40} />
        <MobileNav />
      </div>
      <div className="mx-auto flex max-w-7xl md:max-w-5xl min-w-20 flex-col space-y-14">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="size-6 text-yellow-500" />
              <h1 className="header">Day-off requests</h1>
            </div>
            <p className="text-dark-700">
              Sorted by soonest date. Requests that would leave a specialty fully uncovered are flagged.
            </p>
          </section>

          {!isLoading && pendingRanges.length > 0 && (
            <section className="admin-stat">
              <div className="rounded-xl border border-dark-500 bg-dark-400 p-5 flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center size-11 rounded-full bg-yellow-500/10 shrink-0">
                  <CalendarClock className="size-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-24-bold text-white">{pendingRanges.length}</p>
                  <p className="text-14-regular text-dark-700">Pending requests</p>
                </div>
              </div>
              <div className="rounded-xl border border-dark-500 bg-dark-400 p-5 flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center size-11 rounded-full bg-green-500/10 shrink-0">
                  <Users className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-24-bold text-white">{affectedDoctorCount}</p>
                  <p className="text-14-regular text-dark-700">Doctors requesting</p>
                </div>
              </div>
              <div className="rounded-xl border border-dark-500 bg-dark-400 p-5 flex items-center gap-4 flex-1">
                <div className="flex items-center justify-center size-11 rounded-full bg-red-500/10 shrink-0">
                  <AlertTriangle className="size-5 text-red-400" />
                </div>
                <div>
                  <p className="text-24-bold text-white">{conflictCount}</p>
                  <p className="text-14-regular text-dark-700">Coverage conflicts</p>
                </div>
              </div>
            </section>
          )}

          {!isLoading && pendingRanges.length > 0 && (
            <SearchBar
              query={query}
              setQuery={setQuery}
              placeholder="Search by doctor name"
            />
          )}

          {isLoading ? (
            <p className="text-14-regular text-dark-700">Loading...</p>
          ) : pendingRanges.length === 0 ? (
            <p className="text-14-regular text-dark-700">No pending requests.</p>
          ) : filteredRanges.length === 0 ? (
            <p className="text-14-regular text-dark-700">No matching requests.</p>
          ) : (
            <div className="w-full space-y-3">
              {filteredRanges.map((range) => {
                const key = `${range.doctor.$id}-${range.startDate}`;
                const isSingleDay = range.startDate === range.endDate;
                const rangeLabel = isSingleDay
                  ? formatDateLabel(range.startDate)
                  : `${formatDateLabel(range.startDate)} → ${formatDateLabel(range.endDate)}`;

                return (
                  <div
                    key={key}
                    className={cn(
                      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-dark-400 p-4",
                      range.isConflict ? "border-red-500/50" : "border-dark-500"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={range.doctor.image ? getImageUrl(range.doctor.image) : "/assets/images/admin.png"}
                        width={44}
                        height={44}
                        alt={range.doctor.name}
                        className="rounded-full border border-dark-500 object-cover size-11 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-14-semibold text-white truncate">
                          Dr. {range.doctor.name}
                        </p>
                        <p className="text-12-regular text-dark-700 truncate">
                          {range.doctor.specialization} · {rangeLabel}
                          {range.dates.length > 1 && ` · ${range.dates.length} days`}
                        </p>
                        {range.isConflict ? (
                          <p className="flex items-center gap-1 text-12-medium text-red-400 mt-1">
                            <AlertTriangle className="size-3" />
                            All {range.specialtyTotal} {range.doctor.specialization.toLowerCase()}
                            {range.specialtyTotal > 1 ? "s" : ""} would be out
                          </p>
                        ) : (
                          <p className="text-12-regular text-dark-700 mt-0.5">
                            {range.wouldBeOutCount}/{range.specialtyTotal} {range.doctor.specialization.toLowerCase()}
                            {range.specialtyTotal > 1 ? "s" : ""} out this period
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                      <button
                        onClick={() => handleApprove(range)}
                        disabled={processingKey === key}
                        className="flex items-center gap-1 text-13-medium text-green-500 hover:text-green-400 transition-colors px-3 py-1.5 rounded-md hover:bg-green-500/10"
                      >
                        <Check className="size-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleDeny(range)}
                        disabled={processingKey === key}
                        className="flex items-center gap-1 text-13-medium text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-md hover:bg-red-500/10"
                      >
                        <X className="size-4" />
                        Deny
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DayOffRequestsPage;