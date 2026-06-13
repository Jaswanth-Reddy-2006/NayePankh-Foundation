import React from "react";
import { query } from "@/lib/db";
import ReportsCenterClient from "@/components/dashboard/ReportsCenterClient";

export default async function AdminReportsPage() {
  // 1. Fetch volunteers
  const volsRes = await query("SELECT * FROM users WHERE role = 'volunteer' ORDER BY name ASC");
  const volunteers = volsRes.rows.map((v) => ({
    ...v,
    _id: v.id.toString(),
    volunteerHours: v.volunteer_hours,
    profileImage: v.profile_image,
    createdAt: v.created_at.toISOString(),
  }));

  // 2. Fetch events
  const eventsRes = await query("SELECT * FROM events ORDER BY date DESC");
  const events = eventsRes.rows.map((e) => ({
    ...e,
    _id: e.id.toString(),
    requiredVolunteers: e.required_volunteers,
    bannerImage: e.banner_image,
    skillsRequired: e.skills_required || [],
    date: e.date.toISOString(),
    createdAt: e.created_at.toISOString(),
  }));

  // 3. Fetch applications populated with volunteer and event info
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
        <h1 className="text-3xl font-extrabold tracking-tight">NGO Reports Center</h1>
        <p className="text-muted-foreground mt-1">
          Generate system-wide analytics, preview data tables, and export reports to PDF or Excel.
        </p>
      </div>

      <ReportsCenterClient
        volunteers={volunteers as any}
        events={events as any}
        applications={applications as any}
      />
    </div>
  );
}
