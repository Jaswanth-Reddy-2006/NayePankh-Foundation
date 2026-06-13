"use server";

import { query } from "@/lib/db";
import { eventSchema } from "@/validations/event";
import { revalidatePath } from "next/cache";

export async function handleCreateEvent(data: any) {
  try {
    // Validate inputs
    const validated = eventSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const insertRes = await query(
      `INSERT INTO events (title, description, category, date, time, venue, required_volunteers, banner_image, skills_required, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [
        validated.data.title,
        validated.data.description,
        validated.data.category,
        new Date(validated.data.date).toISOString(),
        validated.data.time,
        validated.data.venue,
        validated.data.requiredVolunteers,
        validated.data.bannerImage,
        validated.data.skillsRequired,
        "open",
      ]
    );

    const newEventId = insertRes.rows[0].id;

    revalidatePath("/dashboard");
    revalidatePath("/admin/events");

    return { success: true, eventId: newEventId.toString() };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: error.message || "Failed to create event" };
  }
}

export async function handleEditEvent(eventId: string, data: any) {
  try {
    // Validate inputs
    const validated = eventSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const updateRes = await query(
      `UPDATE events SET
        title = $1,
        description = $2,
        category = $3,
        date = $4,
        time = $5,
        venue = $6,
        required_volunteers = $7,
        banner_image = $8,
        skills_required = $9,
        updated_at = NOW()
       WHERE id = $10 RETURNING id`,
      [
        validated.data.title,
        validated.data.description,
        validated.data.category,
        new Date(validated.data.date).toISOString(),
        validated.data.time,
        validated.data.venue,
        validated.data.requiredVolunteers,
        validated.data.bannerImage,
        validated.data.skillsRequired,
        parseInt(eventId, 10),
      ]
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      return { error: "Event not found" };
    }

    const updatedEventId = updateRes.rows[0].id;

    revalidatePath("/dashboard");
    revalidatePath("/admin/events");

    return { success: true, eventId: updatedEventId.toString() };
  } catch (error: any) {
    console.error("Edit event error:", error);
    return { error: error.message || "Failed to edit event" };
  }
}

export async function handleDeleteEvent(eventId: string) {
  try {
    const eventIdNum = parseInt(eventId, 10);

    // Delete event (associated applications CASCADE delete automatically due to SQL foreign key ON DELETE CASCADE)
    const deleteRes = await query("DELETE FROM events WHERE id = $1 RETURNING id", [eventIdNum]);
    if ((deleteRes.rowCount ?? 0) === 0) {
      return { error: "Event not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/events");

    return { success: true, message: "Event and associated applications deleted successfully" };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { error: error.message || "Failed to delete event" };
  }
}

export async function handleToggleEventStatus(eventId: string) {
  try {
    const eventIdNum = parseInt(eventId, 10);

    const selectRes = await query("SELECT status FROM events WHERE id = $1", [eventIdNum]);
    if ((selectRes.rowCount ?? 0) === 0) {
      return { error: "Event not found" };
    }

    const currentStatus = selectRes.rows[0].status;
    const newStatus = currentStatus === "open" ? "closed" : "open";

    await query("UPDATE events SET status = $1 WHERE id = $2", [newStatus, eventIdNum]);

    revalidatePath("/dashboard");
    revalidatePath("/admin/events");

    return { success: true, status: newStatus };
  } catch (error: any) {
    console.error("Toggle event status error:", error);
    return { error: error.message || "Failed to toggle event status" };
  }
}
