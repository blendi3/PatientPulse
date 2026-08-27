"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAppointmentReleased } from "@/lib/actions/appointment.actions";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ReleaseNotesButton = ({
  appointmentId,
  isReleased,
}: {
  appointmentId: string;
  isReleased: boolean;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRelease = async () => {
    setIsLoading(true);
    try {
      const result = await setAppointmentReleased(appointmentId, true);
      if (result.success) {
        toast.success("Notes released to patient.");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to release notes.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isReleased) {
    return (
      <span className="flex items-center gap-1 text-12-medium text-green-500">
        <CheckCircle2 className="size-3.5" />
        Released to patient
      </span>
    );
  }

  return (
    <button
      onClick={handleRelease}
      disabled={isLoading}
      className="flex items-center gap-1 text-12-medium text-yellow-500 hover:text-yellow-400"
    >
      {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
      Release to patient
    </button>
  );
};

export default ReleaseNotesButton;
