"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { resetDoctorPassword } from "@/lib/actions/doctor.actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RotateCcw, Loader2 } from "lucide-react";

const ResetDoctorPasswordButton = ({ userId }: { userId: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm("Reset this doctor's password? They'll need the new temporary password to log in.")) return;

    setIsLoading(true);
    try {
      const result = await resetDoctorPassword(userId);
      if (result.success) {
        toast.success(
          `Password reset! New temporary password: ${result.tempPassword}`,
          { autoClose: false }
        );
      } else {
        toast.error(result.error || "Failed to reset password.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      disabled={isLoading}
      className="text-14-regular text-dark-700 hover:text-white flex items-center gap-1"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RotateCcw className="size-4" />
      )}
    </Button>
  );
};

export default ResetDoctorPasswordButton;
