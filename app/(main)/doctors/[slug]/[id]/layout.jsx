import { redirect } from "next/navigation";

import { getDoctorById } from "@/actions/appointments";

import PageHeader from "@/components/PageHeader";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { doctor } = await getDoctorById(id);

  return {
    title: `Dr. ${doctor.name} - MediMeet`,
    description: `Book an appointment with Dr. ${doctor.name}, ${doctor.specialty} specialist with ${doctor.experience} years of experience.`,
  };
}

async function DoctorProfileLayout({ children, params }) {
  const { id } = await params;
  const { doctor } = await getDoctorById(id);

  // console.log("id: " + id);
  // console.log("doctor: " + doctor)

  if (!doctor) {
    redirect("/doctors");
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title={"Dr. " + doctor.name}
        backLink={`/doctors/${doctor.specialty}`}
        backLabel={`Back to ${doctor.specialty}`}
      />
      {children}
    </div>
  );
}

export default DoctorProfileLayout;
