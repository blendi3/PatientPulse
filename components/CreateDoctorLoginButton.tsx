"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { createDoctorLogin } from "@/lib/actions/doctor.actions";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { KeyRound, Loader2 } from "lucide-react";

const CreateDoctorLoginButton = ({
  doctorId,
  email,
  name,
  onCreated,
}: {
  doctorId: string;
  email: string;
  name: string;
  onCreated: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await createDoctorLogin(doctorId, email, name);
      if (result.success) {
        toast.success(
          `Login created! Temporary password: ${result.tempPassword}`,
          { autoClose: false }
        );
        onCreated();
      } else {
        toast.error(result.error || "Failed to create login.");
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
      className="text-14-regular text-green-500 flex items-center gap-1"
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <KeyRound className="size-4" />
      )}
      Create Login
    </Button>
  );
};

export default CreateDoctorLoginButton;
