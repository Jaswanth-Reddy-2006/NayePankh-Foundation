"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileSchema } from "@/validations/auth";
import { handleUpdateProfile } from "@/actions/authActions";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, User, Phone, MapPin, GraduationCap, Calendar, Compass, Code2, Sparkles } from "lucide-react";
import { IUser } from "@/types";

interface ProfileClientFormProps {
  user: IUser;
}

export default function ProfileClientForm({ user }: ProfileClientFormProps) {
  const { update } = useSession();
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Dynamic tags states
  const [skillInput, setSkillInput] = React.useState("");
  const [interestInput, setInterestInput] = React.useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
      dob: user.dob || "",
      gender: user.gender || "",
      address: user.address || "",
      education: user.education || "",
      skills: user.skills || [],
      interests: user.interests || [],
      profileImage: user.profileImage || "",
    },
  });

  const watchSkills = watch("skills") || [];
  const watchInterests = watch("interests") || [];

  // Add a skill
  const addSkill = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const cleanInput = skillInput.trim();
    if (cleanInput && !watchSkills.includes(cleanInput)) {
      setValue("skills", [...watchSkills, cleanInput]);
      setSkillInput("");
    }
  };

  // Remove a skill
  const removeSkill = (indexToRemove: number) => {
    setValue(
      "skills",
      watchSkills.filter((_, idx) => idx !== indexToRemove)
    );
  };

  // Add an interest
  const addInterest = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const cleanInput = interestInput.trim();
    if (cleanInput && !watchInterests.includes(cleanInput)) {
      setValue("interests", [...watchInterests, cleanInput]);
      setInterestInput("");
    }
  };

  // Remove an interest
  const removeInterest = (indexToRemove: number) => {
    setValue(
      "interests",
      watchInterests.filter((_, idx) => idx !== indexToRemove)
    );
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    const res = await handleUpdateProfile(user._id, data);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Profile updated successfully!");
      // Re-trigger NextAuth session update to synchronize header
      update({ name: data.name });
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-2xl">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar and Info Summary */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader className="text-center">
            <div className="mx-auto relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-md">
              {watch("profileImage") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watch("profileImage")}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <CardTitle className="mt-4">{watch("name")}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <span className="inline-block mt-2 text-[10px] bg-primary/15 text-primary uppercase font-bold px-2 py-0.5 rounded mx-auto w-fit">
              {user.role}
            </span>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 border-t border-white/5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Profile Image URL
              </label>
              <Input
                type="text"
                placeholder="https://example.com/image.jpg"
                {...register("profileImage")}
                disabled={loading}
              />
            </div>
            <div className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-bold uppercase text-primary">{user.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Hours Logged:</span>
                <span className="font-bold text-foreground">{user.volunteerHours || 0} hrs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: General Info, Skills, Interests */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Fields Card */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Update your personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
                    <Input className="pl-10" {...register("name")} disabled={loading} />
                  </div>
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
                    <Input
                      type="tel"
                      placeholder="9998887776"
                      className="pl-10"
                      {...register("phone")}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DOB */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
                    <Input type="date" className="pl-10" {...register("dob")} disabled={loading} />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Gender
                  </label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("gender")}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Education
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
                    <Input
                      type="text"
                      placeholder="e.g. High School, B.Tech Graduate"
                      className="pl-10"
                      {...register("education")}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute inset-y-0 left-3 h-4 w-4 text-muted-foreground my-auto" />
                    <Input
                      type="text"
                      placeholder="e.g. Flat 101, Park Lane"
                      className="pl-10"
                      {...register("address")}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills & Interests Dynamic Tags Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary fill-current" />
                <span>Skills & Interests Profile</span>
              </CardTitle>
              <CardDescription>
                These tags are used by the AI algorithm to match you with appropriate volunteer events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skills */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  <span>My Skills</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a skill (e.g. Teaching, First Aid) and click Add"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill(e);
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" size="sm" onClick={addSkill} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {watchSkills.length > 0 ? (
                    watchSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-semibold flex items-center space-x-1"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkill(idx)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No skills listed yet</span>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="block text-xs font-semibold uppercase tracking-wider flex items-center space-x-1.5">
                  <Compass className="h-3.5 w-3.5 text-primary" />
                  <span>My Interests</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type an interest (e.g. Education, Health, Environment) and click Add"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInterest(e);
                      }
                    }}
                    disabled={loading}
                  />
                  <Button type="button" size="sm" onClick={addInterest} disabled={loading}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {watchInterests.length > 0 ? (
                    watchInterests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full font-semibold flex items-center space-x-1"
                      >
                        <span>{interest}</span>
                        <button
                          type="button"
                          onClick={() => removeInterest(idx)}
                          className="hover:bg-purple-500/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No interests listed yet</span>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-4 border-t border-white/5">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving changes..." : "Save Profile"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}
