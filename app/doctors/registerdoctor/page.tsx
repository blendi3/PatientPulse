import DoctorForm from "@/components/forms/DoctorForm";
import MobileNav from "@/components/MobileNav";
import NewRole from "@/components/NewRole";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const RegisterDoctors = () => {
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
        <main className="admin-main-costum">
          <Breadcrumb className="breadcrumb-modern">
            <BreadcrumbList className="breadcrumb-list-modern">
              <BreadcrumbItem className="breadcrumb-item-modern">
                <BreadcrumbLink
                  href="/doctors"
                  className="breadcrumb-link-modern"
                >
                  Doctors
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="breadcrumb-separator-modern" />
              <BreadcrumbItem className="breadcrumb-item-modern">
                <BreadcrumbPage className="breadcrumb-page-modern">
                  Register Doctors
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <section className="w-full space-y-4">
            <div className="flex flex-col md:flex md:justify-between md:flex-row">
              <div>
                <h1 className="header mb-4">Register a doctor</h1>
                <p className="text-dark-700 mb-4">
                  Here you can register a new doctor to the system
                </p>
              </div>
              <div>
                <NewRole />
              </div>
            </div>
          </section>

          <div className="admin-stat p-4 md:p-10 rounded-md shadow-lg border border-gray-700">
            <DoctorForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterDoctors;
