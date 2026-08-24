"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Loader2 } from "lucide-react";
import { updateDoctor, getCreatedRoles } from "@/lib/actions/doctor.actions";
import { Doctor } from "@/types/appwrite.types";
import Image from "next/image";
import { getImageUrl } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EditDoctorModal = ({
  doctor,
  onUpdated,
}: {
  doctor: Doctor;
  onUpdated?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(doctor.name);
  const [email, setEmail] = useState(doctor.email);
  const [phone, setPhone] = useState(doctor.phone);
  const [specialization, setSpecialization] = useState(doctor.specialization);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpecializations = async () => {
      const specs = await getCreatedRoles();
      setSpecializations(specs);
    };
    fetchSpecializations();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageBase64 = "";
      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(arrayBuffer).toString("base64");
      }

   const result = await updateDoctor(doctor.$id, doctor.name, {
  name,
  email,
  phone,
  specialization,
  ...(imageBase64 && { image: imageBase64 }),
});

      if (result.success) {
        toast.success("Doctor updated successfully!");
        setIsOpen(false);
        onUpdated && onUpdated();
      } else {
        toast.error(result.error || "Failed to update doctor.");
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
        <Button variant="ghost" className="text-14-regular">
          <Pencil className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="shad-dialog sm:max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit Doctor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <Image
              src={
                imageFile
                  ? URL.createObjectURL(imageFile)
                  : doctor.image
                  ? getImageUrl(doctor.image)
                  : "/assets/images/dr-green.png"
              }
              width={56}
              height={56}
              alt={doctor.name}
              className="rounded-full border border-dark-500 object-cover size-14"
            />
            <label className="text-14-regular text-green-500 cursor-pointer">
              Change photo
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="rounded-md border border-dark-500 bg-dark-400">
            <Input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="shad-input border-0"
            />
          </div>

          <div className="rounded-md border border-dark-500 bg-dark-400">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="shad-input border-0"
            />
          </div>

          <div className="rounded-md border border-dark-500 bg-dark-400">
            <Input
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="shad-input border-0"
            />
          </div>

          <Select value={specialization} onValueChange={setSpecialization}>
            <SelectTrigger className="shad-select-trigger">
              <SelectValue placeholder="Select a specialization" />
            </SelectTrigger>
            <SelectContent className="shad-select-content">
              {specializations.map((spec, i) => (
                <SelectItem
                  key={i}
                  value={spec}
                  className="hover:bg-dark-500 cursor-pointer"
                >
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            disabled={isLoading}
            className="shad-primary-btn w-full"
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

export default EditDoctorModal;