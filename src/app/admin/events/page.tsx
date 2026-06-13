import React from "react";
import { query } from "@/lib/db";
import EventsBoardClient from "@/components/dashboard/EventsBoardClient";

export default async function AdminEventsPage() {
  // Fetch all events
  const eventsRes = await query("SELECT * FROM events ORDER BY date DESC");

  const events = eventsRes.rows.map((event) => ({
    ...event,
    _id: event.id.toString(),
    requiredVolunteers: event.required_volunteers,
    bannerImage: event.banner_image,
    skillsRequired: event.skills_required || [],
    date: event.date.toISOString(),
    createdAt: event.created_at.toISOString(),
    updatedAt: event.updated_at.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">NGO Event Board</h1>
          <p className="text-muted-foreground mt-1">
            Publish, edit, delete, and coordinate NGO campaigns and volunteering operations.
          </p>
        </div>
      </div>

      <EventsBoardClient initialEvents={events as any} />
    </div>
  );
}
