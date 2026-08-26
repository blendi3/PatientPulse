"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const AvailabilityCalendar = ({
  unavailableDates,
  pendingDates,
  onToggleDate,
}: {
  unavailableDates: string[];
  pendingDates: string[];
  onToggleDate: (dateStr: string, currentlyPending: boolean) => void;
}) => {
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthLabel = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const toDateStr = (d: Date) => d.toISOString().split("T")[0];

  return (
    <div className="rounded-xl border border-dark-500 bg-dark-400 p-5">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex items-center justify-center size-8 rounded-md hover:bg-dark-300 text-dark-700 hover:text-white transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-15-semibold text-white">{monthLabel}</p>
        <button
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex items-center justify-center size-8 rounded-md hover:bg-dark-300 text-dark-700 hover:text-white transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <p key={i} className="text-12-medium text-dark-700 text-center py-1">
            {d}
          </p>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;

          const dateStr = toDateStr(date);
          const isPast = date < today;
          const isApproved = unavailableDates.includes(dateStr);
          const isPending = pendingDates.includes(dateStr);
          const isToday = date.getTime() === today.getTime();

          return (
            <button
              key={i}
              disabled={isPast || isApproved}
              onClick={() => onToggleDate(dateStr, isPending)}
              className={cn(
                "aspect-square rounded-md text-14-medium transition-colors flex items-center justify-center",
                isPast && "text-dark-600 cursor-not-allowed",
                !isPast && !isApproved && !isPending && "text-white hover:bg-dark-300",
                isPending && "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
                isApproved && "bg-red-500/20 text-red-400 cursor-not-allowed",
                isToday && !isApproved && !isPending && "border border-green-500"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-dark-500">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded bg-yellow-500/20 border border-yellow-500/40" />
          <p className="text-12-regular text-dark-700">Pending approval</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded bg-red-500/20 border border-red-500/40" />
          <p className="text-12-regular text-dark-700">Approved off</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-3 rounded border border-green-500" />
          <p className="text-12-regular text-dark-700">Today</p>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;