"use server";

import { query, getClient } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function handleApplyToEvent(volunteerId: string, eventId: string) {
  try {
    const vId = parseInt(volunteerId, 10);
    const eId = parseInt(eventId, 10);

    // Verify volunteer status
    const volRes = await query("SELECT status FROM users WHERE id = $1", [vId]);
    if ((volRes.rowCount ?? 0) === 0) {
      return { error: "Volunteer profile not found" };
    }

    const volunteer = volRes.rows[0];
    if (volunteer.status === "rejected") {
      return { error: "Your volunteer account has been rejected by administrators. You cannot apply for events." };
    }

    // Verify event exists and is open
    const eventRes = await query("SELECT status FROM events WHERE id = $1", [eId]);
    if ((eventRes.rowCount ?? 0) === 0) {
      return { error: "Event not found" };
    }

    const event = eventRes.rows[0];
    if (event.status === "closed") {
      return { error: "This event is closed for registrations." };
    }

    // Create application
    const insertRes = await query(
      "INSERT INTO applications (volunteer_id, event_id, status) VALUES ($1, $2, 'pending') RETURNING id",
      [vId, eId]
    );

    const newAppId = insertRes.rows[0].id;

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/events`);
    revalidatePath("/admin/applications");

    return { success: true, applicationId: newAppId.toString() };
  } catch (error: any) {
    console.error("Apply to event error:", error);
    // PG Unique Violation Code is 23505
    if (error.code === "23505") {
      return { error: "You have already applied for this event" };
    }
    return { error: error.message || "Failed to submit application" };
  }
}

export async function handleWithdrawApplication(applicationId: string) {
  try {
    const appIdNum = parseInt(applicationId, 10);

    const deleteRes = await query("DELETE FROM applications WHERE id = $1 RETURNING id", [appIdNum]);
    if ((deleteRes.rowCount ?? 0) === 0) {
      return { error: "Application not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/applications");

    return { success: true, message: "Application withdrawn successfully" };
  } catch (error: any) {
    console.error("Withdraw application error:", error);
    return { error: error.message || "Failed to withdraw application" };
  }
}

export async function handleUpdateApplicationStatus(
  applicationId: string,
  status: "approved" | "rejected",
  hoursLogged: number = 0
) {
  const client = await getClient();
  try {
    const appIdNum = parseInt(applicationId, 10);
    
    // Start atomic transaction
    await client.query("BEGIN");

    // Fetch existing application
    const appRes = await client.query("SELECT * FROM applications WHERE id = $1", [appIdNum]);
    if ((appRes.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      return { error: "Application not found" };
    }

    const application = appRes.rows[0];

    // If it was already approved, don't re-approve to avoid double-logging hours
    if (application.status === "approved" && status === "approved") {
      await client.query("ROLLBACK");
      return { error: "Application is already approved" };
    }

    const oldStatus = application.status;
    const volunteerId = application.volunteer_id;
    const eventId = application.event_id;

    // Update application
    await client.query(
      "UPDATE applications SET status = $1, hours_logged = $2, updated_at = NOW() WHERE id = $3",
      [status, hoursLogged, appIdNum]
    );

    if (status === "approved") {
      // 1. Increment volunteer hours in users table
      await client.query(
        "UPDATE users SET volunteer_hours = volunteer_hours + $1 WHERE id = $2",
        [hoursLogged, volunteerId]
      );

      // 2. Automatically generate certificate
      const verificationCode = `VAL-${Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase()}-${Date.now().toString().slice(-4)}`;

      // Check if a certificate already exists to prevent duplicates
      const certExistsRes = await client.query(
        "SELECT id FROM certificates WHERE volunteer_id = $1 AND event_id = $2",
        [volunteerId, eventId]
      );

      if ((certExistsRes.rowCount ?? 0) === 0) {
        await client.query(
          `INSERT INTO certificates (volunteer_id, event_id, verification_code, issue_date)
           VALUES ($1, $2, $3, NOW())`,
          [volunteerId, eventId, verificationCode]
        );
      }
    } else if (oldStatus === "approved" && status === "rejected") {
      // Revert hours if changing from approved to rejected
      await client.query(
        "UPDATE users SET volunteer_hours = volunteer_hours - $1 WHERE id = $2",
        [application.hours_logged, volunteerId]
      );
      // Delete the certificate
      await client.query(
        "DELETE FROM certificates WHERE volunteer_id = $1 AND event_id = $2",
        [volunteerId, eventId]
      );
    }

    await client.query("COMMIT");

    revalidatePath("/dashboard");
    revalidatePath("/admin/applications");
    revalidatePath("/admin/volunteers");

    return { success: true, message: `Application updated to ${status} and hours logged.` };
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Update application status error:", error);
    return { error: error.message || "Failed to update application status" };
  } finally {
    client.release();
  }
}
