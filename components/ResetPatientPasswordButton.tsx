"use client";

import { useState } from "react";
import { resetPatientPasswordByEmail } from "@/lib/actions/patient.actions";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPatientPasswordButton = ({
  email,
  patientName,
}: {
  email: string;
  patientName: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!confirm(`Reset the password for ${patientName}? A new temporary password will be generated.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPatientPasswordByEmail(email);
      if (result.success) {
        toast.success(
          `New password for ${patientName}: ${result.tempPassword} — share this with them directly.`,
          { autoClose: false }
        );
      } else {
        toast.error(result.error || "Failed to reset password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleReset}
      disabled={isLoading}
      className="flex items-center gap-1 text-14-regular text-yellow-500 hover:text-yellow-400"
    >
      {isLoading ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
      Reset
    </button>
  );
};

export default ResetPatientPasswordButton;
