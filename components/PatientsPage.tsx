"use client";

import React, { useState, useEffect } from "react";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { PatientsTable } from "@/components/table/PatientsTable";
import { patientscolum } from "@/components/table/patientscolum";
import { getPatients } from "@/lib/actions/patient.actions";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import { Appointment } from "@/types/appwrite.types";

const PatientsPage = () => {
  const [patients, setPatients] = useState<Appointment[]>([]);
  const [query, setQuery] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      const patientsData = await getPatients();
      setPatients(patientsData);
      setFilteredPatients(patientsData);
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    setFilteredPatients(
      patients.filter((patient) =>
        patient.user.name.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query, patients]);

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
      <div className="flex-1 mx-auto max-w-7xl md:max-w-6xl flex flex-col space-y-14 xl:p-4">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <div className="flex flex-col md:flex md:justify-between md:flex-row">
              <div>
                <h1 className="header mb-4">Patients</h1>
                <p className="text-dark-700 mb-4">
                  Here you can see all the patients that are registered in the
                  system
                </p>
              </div>
              <div>
                <SearchBar
                  query={query}
                  setQuery={setQuery}
                  placeholder="Search patients by name"
                />
              </div>
            </div>
          </section>
          <PatientsTable columns={patientscolum} data={filteredPatients} />
        </main>
      </div>
    </div>
  );
};

export default PatientsPage;
