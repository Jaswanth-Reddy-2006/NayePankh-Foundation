import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import CertificateListClient from "@/components/dashboard/CertificateListClient";

export default async function CertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userIdNum = parseInt(session.user.id, 10);

  // Fetch certificates populate event details using SQL JOIN
  const certsRes = await query(
    `SELECT c.*,
            e.title as event_title,
            e.category as event_category,
            e.date as event_date,
            e.venue as event_venue
     FROM certificates c
     JOIN events e ON c.event_id = e.id
     WHERE c.volunteer_id = $1
     ORDER BY c.issue_date DESC`,
    [userIdNum]
  );

  const certificates = certsRes.rows.map((row) => ({
    _id: row.id.toString(),
    volunteerId: row.volunteer_id.toString(),
    eventId: {
      _id: row.event_id.toString(),
      title: row.event_title,
      category: row.event_category,
      date: row.event_date.toISOString(),
      venue: row.event_venue,
    },
    issueDate: row.issue_date.toISOString(),
    verificationCode: row.verification_code,
  }));

  const volunteerName = session.user.name || "Volunteer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">My Certificates</h1>
        <p className="text-muted-foreground mt-1">
          View, verify, and download your earned volunteer accomplishment certificates.
        </p>
      </div>

      <CertificateListClient
        certificates={certificates as any}
        volunteerName={volunteerName}
      />
    </div>
  );
}
