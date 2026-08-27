"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { setPatientPassword } from "@/lib/actions/patient.actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { KeyRound, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";

const SetPatientPasswordForm = ({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await setPatientPassword(userId, password);
      if (result.success) {
        toast.success("Password set!");
        setIsDone(true);
      } else {
        toast.error(result.error || "Failed to set password.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 space-y-2">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-5 text-green-500 shrink-0" />
          <p className="text-14-semibold text-white">You're all set!</p>
        </div>
        <p className="text-13-regular text-dark-700">
          To view or manage this appointment later, go to{" "}
          <span className="text-white font-semibold">My Appointments</span> and sign in with:
        </p>
        <div className="rounded-md bg-dark-300 border border-dark-500 px-3 py-2">
          <p className="text-13-medium text-white">{email}</p>
        </div>
        <p className="text-12-regular text-dark-700">
          Use the password you just created.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dark-500 bg-dark-400 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="size-5 text-green-500" />
        <p className="text-15-semibold text-white">Manage this appointment anytime</p>
      </div>
      <p className="text-13-regular text-dark-700">
        Set a password to log in later using{" "}
        <span className="text-white font-semibold">{email}</span> — your registered email — to
        view, cancel, or reschedule your appointment.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 rounded-md border border-dark-500 bg-dark-300 px-3">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Choose a password (min. 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="shad-input border-0 px-0"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-dark-600 hover:text-white transition-colors shrink-0"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="shad-primary-btn px-6 h-11 rounded-lg text-14-semibold whitespace-nowrap"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Set Password"}
        </button>
      </form>
    </div>
  );
};

export default SetPatientPasswordForm;
