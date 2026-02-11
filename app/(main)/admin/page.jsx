import { TabsContent } from "@/components/ui/tabs";
import React from "react";
import { PendingDoctors } from "./_components/pending-doctors";
import { VerifiedDoctors } from "./_components/verified-doctors";
import { getPendingDoctors, getVerifiedDoctors } from "@/actions/admin";

// Fetch all data in parallel
const AdminPage = async () => {
  const [pendingDoctorsData, verifiedDoctorsData] = await Promise.all([
    getPendingDoctors(),
    getVerifiedDoctors(),
  ]);

  return (
    <>
      <TabsContent value="pending" className="border-none p-0">
        <PendingDoctors doctors={pendingDoctorsData.doctors || []} />
      </TabsContent>

      <TabsContent value="doctors" className="border-none p-0">
        <VerifiedDoctors doctors={verifiedDoctorsData.doctors || []} />
      </TabsContent>
    </>
  );
};
export default AdminPage;
