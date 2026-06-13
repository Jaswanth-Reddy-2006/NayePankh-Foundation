import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import ProfileClientForm from "@/components/dashboard/ProfileClientForm";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const userIdNum = parseInt(session.user.id, 10);

  const userRes = await query("SELECT * FROM users WHERE id = $1", [userIdNum]);
  if ((userRes.rowCount ?? 0) === 0) return <div>User not found</div>;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal details, contact information, skills, and interests for event matching.
        </p>
      </div>

      <ProfileClientForm user={user as any} />
    </div>
  );
}
