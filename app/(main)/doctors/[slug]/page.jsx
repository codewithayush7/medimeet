import { redirect } from "next/navigation";

import { getDoctorsBySpecialty } from "@/actions/doctorsListing";

import PageHeader from "@/components/PageHeader";
import DoctorCard from "@/components/DoctorCard";

async function SpecialityPage({ params }) {
    const { slug } = await params;

    if (!slug) {
        redirect("/doctors");
    }

    const { doctors, error } = await getDoctorsBySpecialty(slug);
    if (error) {
        console.error("Error Fetching doctors", error);
    }

    return (
        <div className="space-y-5">
            <PageHeader
                title={slug.split("%20").join(" ")}
                backLabel="All Specialities"
                backLink="/doctors"
            />
            {doctors && doctors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {doctors.map((doctor) => (
                        <DoctorCard key={doctor.id} doctor={doctor} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <h3 className="text-xl font-medium text-white mb-2">
                        No doctors available
                    </h3>
                    <p className="text-muted-foreground">
                        There are currently no verified doctors in this specialty. Please
                        check back later or choose another specialty.
                    </p>
                </div>
            )}

        </div>
    )
}

export default SpecialityPage;
