"use client";

import { Calendar, dateFnsLocalizer, Event } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import AppointmentModal from "./AppointmentModal";
import { cn } from "@/lib/utils";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

type CalendarAppointment = {
  $id: string;
  schedule: string;
  status: "scheduled" | "pending" | "cancelled";
  primaryPhysician: string;
  patient: { $id: string; name: string };
  userId: string;
};

const statusColors: Record<string, string> = {
  scheduled: "#24AE7C",
  pending: "#F9A825",
  cancelled: "#F37877",
};

const AppointmentCalendar = ({
  appointments,
}: {
  appointments: CalendarAppointment[];
}) => {
  const [selected, setSelected] = useState<CalendarAppointment | null>(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const events = appointments.map((appt) => ({
    id: appt.$id,
    title: `${appt.patient.name} — Dr. ${appt.primaryPhysician}`,
    start: new Date(appt.schedule),
    end: new Date(new Date(appt.schedule).getTime() + 30 * 60000),
    resource: appt,
  }));

  const eventStyleGetter = (event: Event & { resource?: CalendarAppointment }) => {
    const status = event.resource?.status || "pending";
    return {
      style: {
        backgroundColor: statusColors[status],
        borderRadius: "6px",
        border: "none",
        color: "white",
        fontSize: "12px",
      },
    };
  };

  return (
        <div className="rounded-xl border border-dark-500 bg-dark-400 p-4 lg:max-w-none lg:w-full">
      <style jsx global>{`
        .rbc-calendar {
          color: white;
        }
        .rbc-toolbar button {
          color: white;
          border-color: #3f3f46;
        }
        .rbc-toolbar button:hover,
        .rbc-toolbar button.rbc-active {
          background-color: #24ae7c;
          color: white;
          border-color: #24ae7c;
        }
        .rbc-month-view,
        .rbc-time-view,
        .rbc-header,
        .rbc-day-bg,
        .rbc-time-content,
        .rbc-time-header-content {
          border-color: #3f3f46 !important;
        }
        .rbc-off-range-bg {
          background: #18181b;
        }
        .rbc-today {
          background-color: rgba(36, 174, 124, 0.08);
        }
        .rbc-toolbar-label {
          color: white;
        }
      `}</style>
     <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event: any) => setSelected(event.resource)}
        views={["month", "week", "day"]}
        date={date}
        onNavigate={setDate}
        view={view}
        onView={(newView) => setView(newView as "month" | "week" | "day")}
      />

{selected && (
  <AppointmentModal
    type={selected.status === "cancelled" ? "cancel" : "schedule"}
    patientId={selected.patient.$id}
    userId={selected.userId}
    appointment={selected as any}
    open={!!selected}
    onOpenChange={(open) => !open && setSelected(null)}
    hideTrigger
  />
)}
    </div>
  );
};

export default AppointmentCalendar;
