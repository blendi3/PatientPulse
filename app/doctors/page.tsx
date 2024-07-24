import DoctorForm from "@/components/forms/DoctorForm";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";

const DoctorPage = () => {
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
      <div className="flex-1 mx-auto max-w-7xl flex flex-col space-y-14 p-4">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Register a doctor</h1>
            <p className="text-dark-700">
              Here you can register a new doctor to the system
            </p>
          </section>

          <div className="admin-stat p-4 md:p-10 rounded-md shadow-lg border border-gray-700">
            <DoctorForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorPage;
