"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation"; 


export async function setUserRole(formData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Clerk user not found");
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not found");
  }

  //If user exists → fine ; If user doesn't exist → create automatically
  // Safe upsert
  const user = await db.user.upsert({
    where: { clerkUserId: userId },
    update: {},
    create: {
      clerkUserId: userId,
      email: email,
      role: "PATIENT",
    },
  });

  const role = formData.get("role");

  if (!role || !["PATIENT", "DOCTOR"].includes(role)) {
    throw new Error("Invalid role selection");
  }

  try {
    if (role === "PATIENT") {
      await db.user.update({
        where: { clerkUserId: userId },
        data: { role: "PATIENT" },
      });
      revalidatePath("/");
      return { success: true, redirect: "/doctors" };
    }
    // For doctor role - need additional information
    if (role === "DOCTOR") {
      const specialty = formData.get("specialty");
      const experience = parseInt(formData.get("experience"), 10);
      const credentialUrl = formData.get("credentialUrl");
      const description = formData.get("description");

      // Validate inputs
      if (!specialty || !experience || !credentialUrl || !description) {
        throw new Error("All fields are required");
      }

      await db.user.update({
        where: {
          clerkUserId: userId,
        },
        data: {
          role: "DOCTOR",
          specialty,
          experience,
          credentialUrl,
          description,
          verificationStatus: "PENDING",
        },
      });

      redirect("/doctor/verification");
    }
  } catch (error) {
    console.error("Failed to set user role:", error);
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
}

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Find user in our database
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null; // Return null if user not found
  }
}
