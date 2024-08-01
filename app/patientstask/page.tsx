import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { PatientsTable } from "@/components/table/PatientsTable";
import { patientscolum } from "@/components/table/patientscolum";
import { getPatients } from "@/lib/actions/patient.actions";
import Image from "next/image";

const Patients = async () => {
  const patients = await getPatients();
  console.log("patients", patients);
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
      <div className="flex-1 mx-auto max-w-7xl flex flex-col space-y-14 xl:p-4">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <div className="flex flex-col md:flex md:justify-between md:flex-row">
              <div>
                <h1 className="header mb-4">Register a doctor</h1>
                <p className="text-dark-700 mb-4">
                  Here you can register a new doctor to the system
                </p>
              </div>
            </div>
          </section>
          <PatientsTable columns={patientscolum} data={patients} />
        </main>
      </div>
    </div>
  );
};

export default Patients;
