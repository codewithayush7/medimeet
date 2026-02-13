import { getAvailableTimeSlots, getDoctorById } from "@/actions/appointments";
import { redirect } from "next/navigation";

import DoctorProfile from "./_components/DoctorProfile";

async function DoctorProfilePage({ params }) {
    const { id } = await params;

    try {
        const [doctorData, slotsData] = await Promise.all([
            getDoctorById(id),
            getAvailableTimeSlots(id),
        ])

        return (
            <DoctorProfile 
                doctor={doctorData.doctor}
                availableDays={slotsData.days || []}/>
        )
    } catch (error) {
        console.error("Error loading doctor profile: ", error.message);
        redirect("/doctors");
    }

}

export default DoctorProfilePage
