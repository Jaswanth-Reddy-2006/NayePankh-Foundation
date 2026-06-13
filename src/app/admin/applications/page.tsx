import React from "react";
import { query } from "@/lib/db";
import ApplicationsPanelClient from "@/components/dashboard/ApplicationsPanelClient";

export default async function AdminApplicationsPage() {
  // Fetch all applications populated with volunteer and event info using SQL JOINs
  const appsRes = await query(
    `SELECT a.*,
            u.name as volunteer_name,
            u.email as volunteer_email,
            u.status as volunteer_status,
            e.title as event_title,
            e.category as event_category,
            e.date as event_date
     FROM applications a
     JOIN users u ON a.volunteer_id = u.id
     JOIN events e ON a.event_id = e.id
     ORDER BY a.applied_at DESC`
  );

  const applications = appsRes.rows.map((row) => ({
    _id: row.id.toString(),
    volunteerId: {
      _id: row.volunteer_id.toString(),
      name: row.volunteer_name,
      email: row.volunteer_email,
      status: row.volunteer_status,
    },
    eventId: {
      _id: row.event_id.toString(),
      title: row.event_title,
      category: row.event_category,
      date: row.event_date.toISOString(),
    },
    status: row.status,
    appliedAt: row.applied_at.toISOString(),
    hoursLogged: row.hours_logged,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Applications Approval Panel</h1>
        <p className="text-muted-foreground mt-1">
          Review event registration applications, award participation hours, and issue verification certificates.
        </p>
      </div>

      <ApplicationsPanelClient initialApplications={applications as any} />
    </div>
  );
}
