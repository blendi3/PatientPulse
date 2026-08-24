"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Loader2 } from "lucide-react";
import { updatePatient } from "@/lib/actions/patient.actions";

type PatientEditData = {
  $id: string;
  userId: string;
  user: { name: string; email: string; phone?: string };
  address?: string;
  occupation?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  allergies?: string;
  currentMedication?: string;
  identificationType?: string;
  identificationNumber?: string;
};

const EditPatientModal = ({ patient }: { patient: PatientEditData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState(patient.user.name);
  const [email, setEmail] = useState(patient.user.email);
  const [phone, setPhone] = useState(patient.user.phone || "");
  const [address, setAddress] = useState(patient.address || "");
  const [occupation, setOccupation] = useState(patient.occupation || "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    patient.emergencyContactName || ""
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(
    patient.emergencyContactNumber || ""
  );
  const [allergies, setAllergies] = useState(patient.allergies || "");
  const [currentMedication, setCurrentMedication] = useState(
    patient.currentMedication || ""
  );
  const [identificationType, setIdentificationType] = useState(
    patient.identificationType || ""
  );
  const [identificationNumber, setIdentificationNumber] = useState(
    patient.identificationNumber || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
  const result = await updatePatient(
  patient.$id,
  patient.userId,
  {
    name: patient.user.name,
    email: patient.user.email,
    phone: patient.user.phone,
  },
  {
    name,
    email,
    phone,
    address,
    occupation,
    emergencyContactName,
    emergencyContactNumber,
    allergies,
    currentMedication,
    identificationType,
    identificationNumber,
  }
);

      if (result.success) {
        toast.success("Patient updated successfully!");
        setIsOpen(false);
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to update patient.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="shad-gray-btn flex items-center gap-2">
          <Pencil className="size-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent
        className="shad-dialog sm:max-w-2xl max-h-[85vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <p className="text-14-medium text-dark-700">Contact Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-14-medium text-dark-700">Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Emergency contact name"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Emergency contact number"
                  value={emergencyContactNumber}
                  onChange={(e) => setEmergencyContactNumber(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-14-medium text-dark-700">Medical Information</p>
            <Textarea
              placeholder="Allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="shad-textArea"
            />
            <Textarea
              placeholder="Medical history & current medication"
              value={currentMedication}
              onChange={(e) => setCurrentMedication(e.target.value)}
              className="shad-textArea"
            />
          </div>

          <div className="space-y-3">
            <p className="text-14-medium text-dark-700">Identification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Identification type"
                  value={identificationType}
                  onChange={(e) => setIdentificationType(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
              <div className="rounded-md border border-dark-500 bg-dark-400">
                <Input
                  placeholder="Identification number"
                  value={identificationNumber}
                  onChange={(e) => setIdentificationNumber(e.target.value)}
                  className="shad-input border-0"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="shad-primary-btn w-full h-12"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPatientModal;
