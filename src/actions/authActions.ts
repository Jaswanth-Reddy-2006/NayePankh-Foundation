"use server";

import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { registerSchema, profileSchema } from "@/validations/auth";
import { revalidatePath } from "next/cache";

export async function handleRegister(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const roleInput = formData.get("role") as string;

    // Validate inputs
    const validated = registerSchema.safeParse({ name, email, password, role: roleInput });
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const checkUserRes = await query("SELECT id FROM users WHERE email = $1", [normalizedEmail]);
    if ((checkUserRes.rowCount ?? 0) > 0) {
      return { error: "A user with this email address already exists" };
    }

    // Check if there are any users in the DB
    const countUsersRes = await query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(countUsersRes.rows[0].count, 10);

    // Auto-make first user an Admin, or allow explicitly setting role
    let role = validated.data.role;
    let status = "pending";

    if (totalUsers === 0) {
      role = "admin";
      status = "approved"; // First user is approved admin
    } else if (role === "admin" || normalizedEmail.includes("admin")) {
      role = "admin";
      status = "approved"; // Admins are auto-approved
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const insertRes = await query(
      `INSERT INTO users (name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, role`,
      [name, normalizedEmail, hashedPassword, role, status]
    );

    const newUser = insertRes.rows[0];

    return {
      success: true,
      role: newUser.role,
      message: role === "admin"
        ? "Admin account created successfully! Please sign in."
        : "Registration successful! Your application is pending admin approval.",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: error.message || "An error occurred during registration" };
  }
}

export async function handleUpdateProfile(userId: string, data: any) {
  try {
    // Validate input
    const validated = profileSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const updateRes = await query(
      `UPDATE users SET
        name = $1,
        phone = $2,
        dob = $3,
        gender = $4,
        address = $5,
        education = $6,
        skills = $7,
        interests = $8,
        profile_image = $9,
        updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [
        validated.data.name,
        validated.data.phone,
        validated.data.dob,
        validated.data.gender,
        validated.data.address,
        validated.data.education,
        validated.data.skills,
        validated.data.interests,
        validated.data.profileImage,
        parseInt(userId, 10),
      ]
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      return { error: "User not found" };
    }

    const updatedUser = updateRes.rows[0];

    revalidatePath("/dashboard/profile");
    revalidatePath("/admin/volunteers");

    return {
      success: true,
      user: {
        id: updatedUser.id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dob: updatedUser.dob,
        gender: updatedUser.gender,
        address: updatedUser.address,
        education: updatedUser.education,
        skills: updatedUser.skills,
        interests: updatedUser.interests,
        profileImage: updatedUser.profile_image,
        volunteerHours: updatedUser.volunteer_hours,
        status: updatedUser.status,
      },
    };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return { error: error.message || "Failed to update profile" };
  }
}

// Server action to approve, reject, or remove volunteers (Admin only)
export async function handleManageVolunteerStatus(volunteerId: string, status: "approved" | "rejected" | "remove") {
  try {
    const volIdNum = parseInt(volunteerId, 10);

    if (status === "remove") {
      await query("DELETE FROM users WHERE id = $1", [volIdNum]);
      revalidatePath("/admin/volunteers");
      return { success: true, message: "Volunteer removed successfully" };
    }

    const updateRes = await query(
      "UPDATE users SET status = $1 WHERE id = $2 RETURNING id",
      [status, volIdNum]
    );

    if ((updateRes.rowCount ?? 0) === 0) {
      return { error: "User not found" };
    }

    revalidatePath("/admin/volunteers");
    return { success: true, message: `Volunteer has been ${status}` };
  } catch (error: any) {
    console.error("Manage volunteer status error:", error);
    return { error: error.message || "Failed to update volunteer status" };
  }
}
