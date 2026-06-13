import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import EventBrowserClient from "@/components/dashboard/EventBrowserClient";

export default async function EventBrowserPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userIdNum = parseInt(session.user.id, 10);

  // 1. Fetch all open events
  const eventsRes = await query("SELECT * FROM events WHERE status = 'open' ORDER BY date ASC");
  const events = eventsRes.rows.map((event) => ({
    _id: event.id.toString(),
    title: event.title,
    description: event.description,
    category: event.category,
    date: event.date.toISOString(),
    time: event.time,
    venue: event.venue,
    requiredVolunteers: event.required_volunteers,
    bannerImage: event.banner_image,
    status: event.status,
    skillsRequired: event.skills_required || [],
  }));

  // 2. Fetch current user applications
  const appRes = await query("SELECT * FROM applications WHERE volunteer_id = $1", [userIdNum]);
  const userApplications = appRes.rows.map((app) => ({
    _id: app.id.toString(),
    volunteerId: app.volunteer_id.toString(),
    eventId: app.event_id.toString(),
    status: app.status,
    appliedAt: app.applied_at.toISOString(),
    hoursLogged: app.hours_logged,
  }));

  // 3. Fetch user profile
  const userRes = await query("SELECT * FROM users WHERE id = $1", [userIdNum]);
  if ((userRes.rowCount ?? 0) === 0) return <div>Profile not found</div>;
  const dbUser = userRes.rows[0];
  const user = {
    _id: dbUser.id.toString(),
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    status: dbUser.status,
    phone: dbUser.phone,
    dob: dbUser.dob,
    gender: dbUser.gender,
    address: dbUser.address,
    education: dbUser.education,
    skills: dbUser.skills || [],
    interests: dbUser.interests || [],
    profileImage: dbUser.profile_image,
    volunteerHours: dbUser.volunteer_hours,
  };

  // 4. Extract event categories from approved applications for past matching
  const pastCategoriesRes = await query(
    `SELECT DISTINCT e.category
     FROM applications a
     JOIN events e ON a.event_id = e.id
     WHERE a.volunteer_id = $1 AND a.status = 'approved'`,
    [userIdNum]
  );
  const pastCategories = pastCategoriesRes.rows.map((row) => row.category);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Browse NGO Events</h1>
        <p className="text-muted-foreground mt-1">
          Explore volunteer opportunities, check your profile compatibility score, and apply.
        </p>
      </div>

      <EventBrowserClient
        initialEvents={events as any}
        initialApplications={userApplications as any}
        user={user as any}
        pastCategories={pastCategories}
      />
    </div>
  );
}
