"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import MobileNav from "./MobileNav";
import { DataTable } from "./table/DataTable";
import { doctorcolumn } from "./table/doctorcolumns";
import { getDoctorList } from "@/lib/actions/doctor.actions";
import Sidebar from "./Sidebar";
import { Doctor } from "@/types/appwrite.types";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const DoctorComponent = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [query, setQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPatients = async () => {
      const doctorData = await getDoctorList();
      setDoctors(doctorData.documents);
      setFilteredDoctors(doctorData.documents);
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (Array.isArray(doctors)) {
      setFilteredDoctors(
        doctors.filter((doctor) =>
          doctor.name.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      console.error("Doctors is not an array:", doctors);
    }
  }, [query, doctors]);

  const handleRegisterDoctor = () => {
    router.push("/doctors/registerdoctor");
  };

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="root-layout">
        <Image
          src="/assets/icons/logo-icon.svg"
          height={100}
          width={100}
          alt="patient"
          className="size-[45px] xl:h-10 xl:w-fit"
        />
        <MobileNav />
      </div>
      <div className="block md:hidden">
        <MobileNav />
      </div>
      <div className="mx-auto flex-1 flex max-w-7xl md:max-w-6xl min-w-20 flex-col space-y-14">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <div className="flex flex-col md:flex md:justify-between md:flex-row">
              <div>
                <h1 className="header mb-4">Doctors</h1>
                <p className="text-dark-700 mb-4">
                  Here you can see all the doctors that are registered in the
                  system
                </p>
                <Button
                  onClick={handleRegisterDoctor}
                  className="shad-primary-btn mb-4 lg:mb-0"
                >
                  Register a Doctor
                </Button>
              </div>
              <div>
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  placeholder="Search doctors by name"
                />
              </div>
            </div>
          </section>
          <DataTable columns={doctorcolumn} data={filteredDoctors} />
        </main>
      </div>
    </div>
  );
};

export default DoctorComponent;
