import React from "react";
import { query } from "@/lib/db";
import VolunteerDirectoryClient from "@/components/dashboard/VolunteerDirectoryClient";

export default async function AdminVolunteersPage() {
  // Fetch all volunteers
  const volsRes = await query("SELECT * FROM users WHERE role = 'volunteer' ORDER BY created_at DESC");

  const volunteers = volsRes.rows.map((vol) => ({
    ...vol,
    _id: vol.id.toString(),
    volunteerHours: vol.volunteer_hours,
    profileImage: vol.profile_image,
    createdAt: vol.created_at.toISOString(),
    updatedAt: vol.updated_at.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Volunteer Directory</h1>
        <p className="text-muted-foreground mt-1">
          Review registration applications, view profiles, and manage active volunteer listings.
        </p>
      </div>

      <VolunteerDirectoryClient initialVolunteers={volunteers as any} />
    </div>
  );
}
